import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/prisma";

/**
 * A fixed-window rate limiter, counted in Postgres.
 *
 * Nothing here was rate limited before: login, registration, booking and the
 * public review form were all open to as many attempts per second as a script
 * could make. Login is the one that matters most — an unlimited credentials
 * endpoint is an offline password cracker with a network hop in front of it.
 *
 * **Why the database and not a Map.** The app is meant to run on a host that
 * keeps several instances alive, and an in-process counter gives each instance
 * its own private allowance: six instances is six times the limit, invisibly.
 * One upsert per attempt is a write Postgres barely notices, and every instance
 * agrees on the count.
 *
 * **Why a fixed window and not a sliding one.** A fixed window lets a caller
 * spend a full allowance at the end of one window and another at the start of
 * the next — a burst of 2x the limit at the boundary. That is acceptable for
 * what this defends against (credential stuffing, signup floods, review spam)
 * and it costs one row and one statement, where a sliding log costs a row per
 * attempt and a periodic sweep.
 */
export type RateLimitResult = {
  allowed: boolean;
  /** Attempts already used in the current window, including this one. */
  count: number;
  /** Milliseconds until the window resets. */
  retryAfterMs: number;
};

/**
 * Counts one attempt against `key` and says whether it is allowed.
 *
 * The whole thing is a single statement: the upsert both resets an expired
 * window and increments a live one, so two requests arriving together cannot
 * read the same count and both decide they are the first. Doing this as
 * read-then-write in application code is the classic way to build a limiter
 * that does not limit.
 */
export async function consumeRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const windowSeconds = Math.ceil(windowMs / 1000);

  const rows = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>(Prisma.sql`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."windowStart" < now() - ${`${windowSeconds} seconds`}::interval
        THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimit"."windowStart" < now() - ${`${windowSeconds} seconds`}::interval
        THEN now()
        ELSE "RateLimit"."windowStart"
      END
    RETURNING "count", "windowStart"
  `);

  const row = rows[0];

  // A limiter that fails closed would lock everyone out of the site the moment
  // this table had a problem; one that fails open lets attempts through while
  // the database is already struggling. Open is the lesser harm here, because
  // every caller behind this still has its own authorisation check.
  if (!row) return { allowed: true, count: 0, retryAfterMs: 0 };

  const elapsed = Date.now() - new Date(row.windowStart).getTime();

  return {
    allowed: row.count <= limit,
    count: row.count,
    retryAfterMs: Math.max(0, windowMs - elapsed),
  };
}

/**
 * Clears a key's window.
 *
 * Called after a *successful* login, so the allowance counts failures rather
 * than attempts. Without this, someone signing in on a phone, a laptop and a
 * tablet across one afternoon spends the same budget an attacker does, and the
 * limit ends up locking out the person it was meant to protect. Deleting a row
 * that is not there is not an error, which is why this can be called
 * unconditionally.
 */
export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } });
}

/**
 * The caller's IP, as far as it can be known behind a proxy.
 *
 * `x-forwarded-for` is client-controllable when nothing trusted sets it, so this
 * is a throttling key and never an authorisation input. The left-most entry is
 * the original client where the chain is honest, which is the case on Vercel and
 * behind Cloudflare.
 */
export async function callerIp(): Promise<string> {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return list.get("x-real-ip") ?? "unknown";
}

/** Same, for a route handler that already has the Request. */
export function callerIpFrom(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** The limits themselves, in one place so they can be read as a policy. */
export const LIMITS = {
  /** Per email address, and counting *failures* only — a successful sign-in
      clears the window. Tight on purpose: a real person mistypes a password a
      handful of times, a script does not stop. */
  login: { limit: 8, windowMs: 15 * 60_000 },
  /** Per IP. Enough for a family or an office behind one address. */
  register: { limit: 5, windowMs: 60 * 60_000 },
  /** Per account. A customer with more than this many bookings in an hour is
      holding slots, not booking visits. */
  booking: { limit: 12, windowMs: 60 * 60_000 },
  /** Per account. The landing page carries these, so one voice should not be
      able to fill it. */
  siteReview: { limit: 3, windowMs: 24 * 60 * 60_000 },
} as const;

import { prisma } from "@/server/db/prisma";
import { decryptToken, encryptToken } from "@/server/salla/crypto";

/**
 * Salla's HTTP APIs, as documented at docs.salla.dev (checked 2026-11-08):
 *
 * - Merchant API base: https://api.salla.dev/admin/v2 (`/store/info`, `/products`).
 * - Token endpoint: https://accounts.salla.sa/oauth2/token. Access tokens last
 *   14 days, refresh tokens a month, and **refresh tokens are single-use**: a
 *   reused one revokes every token issued from it and the merchant must
 *   reinstall. Hence the row lock in `accessTokenFor`.
 * - Embedded-app introspection: POST `/exchange-authority/v1/introspect` with
 *   the short-lived token Salla puts in our app page's URL and our app id in
 *   `s-source`; it answers with the verified `merchant_id`.
 */

const API = "https://api.salla.dev/admin/v2";
const TOKEN_URL = "https://accounts.salla.sa/oauth2/token";

/** Refresh when less than this is left, so a request never starts on a dying token. */
const REFRESH_MARGIN_MS = 24 * 60 * 60 * 1000;

export class SallaError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

/**
 * Salla's `expires` is documented both as a Unix timestamp (webhook) and as a
 * lifetime in seconds (token response: 1209599). A value too small to be a
 * date after 2001 is a lifetime.
 */
export function expiryFrom(expires: unknown, now = Date.now()): Date | null {
  const n = typeof expires === "string" ? Number(expires) : expires;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  if (n > 1e12) return new Date(n); // milliseconds
  if (n > 1e9) return new Date(n * 1000); // Unix seconds
  return new Date(now + n * 1000); // lifetime in seconds
}

// ------------------------------------------------------------ embedded ----

/** The Salla store id behind an embedded-page token, or null if Salla rejects it. */
export async function introspectEmbeddedToken(token: string): Promise<string | null> {
  const appId = process.env.SALLA_APP_ID;
  if (!appId || !token) return null;

  const res = await fetch(`${API}/exchange-authority/v1/introspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "s-source": appId },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const body = (await res.json().catch(() => null)) as { data?: { merchant_id?: number | string } } | null;
  const id = body?.data?.merchant_id;
  return id === undefined || id === null ? null : String(id);
}

// ------------------------------------------------------------- tokens ----

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires?: number;
  expires_in?: number;
  scope?: string;
};

async function refresh(refreshToken: string): Promise<TokenResponse> {
  const clientId = process.env.SALLA_CLIENT_ID;
  const clientSecret = process.env.SALLA_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new SallaError("SALLA_CLIENT_ID / SALLA_CLIENT_SECRET not set");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new SallaError(`Salla token refresh failed (${res.status})`, res.status);

  const body = (await res.json()) as TokenResponse & { data?: TokenResponse };
  return body.data?.access_token ? body.data : body;
}

/**
 * A usable access token for the store, refreshing it first when it is close to
 * expiry. The refresh runs inside a transaction holding `FOR UPDATE` on the
 * store's row: two requests racing to refresh would spend the single-use
 * refresh token twice, and Salla answers that by revoking the install.
 */
export async function accessTokenFor(storeId: string): Promise<string> {
  const store = await prisma.sallaStore.findUniqueOrThrow({ where: { id: storeId } });
  if (!store.accessTokenEnc || store.uninstalledAt) throw new SallaError("Store is not installed");

  if (store.tokenExpiresAt && store.tokenExpiresAt.getTime() - Date.now() > REFRESH_MARGIN_MS) {
    return decryptToken(store.accessTokenEnc);
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "SallaStore" WHERE "id" = ${storeId} FOR UPDATE`;

      // Re-read under the lock: whoever held it before us may have refreshed.
      const locked = await tx.sallaStore.findUniqueOrThrow({ where: { id: storeId } });
      if (!locked.accessTokenEnc || locked.uninstalledAt) throw new SallaError("Store is not installed");
      if (locked.tokenExpiresAt && locked.tokenExpiresAt.getTime() - Date.now() > REFRESH_MARGIN_MS) {
        return decryptToken(locked.accessTokenEnc);
      }
      if (!locked.refreshTokenEnc) throw new SallaError("No refresh token; the merchant must reinstall");

      const fresh = await refresh(decryptToken(locked.refreshTokenEnc));
      if (!fresh.access_token) throw new SallaError("Salla returned no access token");

      await tx.sallaStore.update({
        where: { id: storeId },
        data: {
          accessTokenEnc: encryptToken(fresh.access_token),
          // Single-use: the old one is spent now, keep the new one or nothing.
          refreshTokenEnc: fresh.refresh_token ? encryptToken(fresh.refresh_token) : null,
          tokenExpiresAt: expiryFrom(fresh.expires ?? fresh.expires_in),
          ...(fresh.scope ? { scope: fresh.scope } : {}),
        },
      });
      return fresh.access_token;
    },
    { timeout: 20_000 },
  );
}

async function get<T>(storeId: string, path: string): Promise<T> {
  const token = await accessTokenFor(storeId);
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new SallaError(`Salla ${path} failed (${res.status})`, res.status);
  return (await res.json()) as T;
}

// --------------------------------------------------------------- data ----

export type SallaStoreInfo = { name: string | null; domain: string | null };

export async function fetchStoreInfo(storeId: string): Promise<SallaStoreInfo> {
  const body = await get<{ data?: { name?: string; domain?: string } }>(storeId, "/store/info");
  return { name: body.data?.name ?? null, domain: body.data?.domain ?? null };
}

export type SallaServiceProduct = { id: string; name: string; price: number };

type ProductRow = {
  id?: number | string;
  name?: string;
  type?: string;
  price?: { amount?: number | string } | number | string;
};

type ProductPage = {
  data?: ProductRow[];
  pagination?: { current?: number; next?: unknown; totalPages?: number };
};

/** Salla's own product types for things that are booked rather than shipped. */
const BOOKABLE_TYPES = new Set(["service", "booking"]);

export function toServiceProduct(row: ProductRow): SallaServiceProduct | null {
  if (!row.id || !row.name || !BOOKABLE_TYPES.has(String(row.type))) return null;
  const raw = typeof row.price === "object" && row.price !== null ? row.price.amount : row.price;
  const price = Number(raw);
  if (!Number.isFinite(price) || price <= 0) return null;
  return { id: String(row.id), name: row.name.trim(), price: Math.round(price * 100) / 100 };
}

/** The store's service and booking products, at most 10 pages of 50. */
export async function fetchServiceProducts(storeId: string): Promise<SallaServiceProduct[]> {
  const found: SallaServiceProduct[] = [];

  for (let page = 1; page <= 10; page++) {
    const body = await get<ProductPage>(storeId, `/products?page=${page}&per_page=50`);
    for (const row of body.data ?? []) {
      const product = toServiceProduct(row);
      if (product) found.push(product);
    }

    const p = body.pagination;
    const more = p?.next ? true : p?.totalPages ? page < p.totalPages : false;
    if (!more || (body.data ?? []).length === 0) break;
  }

  return found;
}

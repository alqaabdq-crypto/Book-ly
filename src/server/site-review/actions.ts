"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db/prisma";
import { consumeRateLimit, LIMITS } from "@/server/security/rate-limit";

const localeSchema = z.enum(routing.locales);

// Testimonials about the platform, rendered on the landing page.
//
// This was open submission — no login, no limit — and what it published went
// straight onto the front page of the site. That is a spam and abuse hole with a
// megaphone attached, and it was not theoretical: a stranger's review arrived
// through it on 2026-09-05. It now requires an account and is capped per
// account per day, and the row records who wrote it, so a bad one can be traced
// and removed rather than merely deleted.
//
// The name field is kept — people sign testimonials with a first name and an
// initial, not an email — but it is now a display name attached to a real
// account, not an unverifiable claim.
const siteReviewSchema = z.object({
  locale: localeSchema,
  name: z.string().trim().min(1).max(60),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(500),
});

export async function createSiteReview(formData: FormData): Promise<void> {
  const raw = {
    locale: formData.get("locale"),
    name: formData.get("name"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  };

  const locale = localeSchema.safeParse(raw.locale).data ?? routing.defaultLocale;

  const parsed = siteReviewSchema.safeParse(raw);
  if (!parsed.success) {
    // Back to the section with an error flag; the form keeps working without JS.
    return redirect({ href: "/?review=error#reviews", locale });
  }

  const session = await auth();
  if (!session?.user) {
    // Back to the section, signed out: the form itself is hidden for signed-out
    // visitors, so reaching here means a direct POST.
    return redirect({ href: "/?review=signin#reviews", locale });
  }

  const attempt = await consumeRateLimit({
    key: `site-review:${session.user.id}`,
    ...LIMITS.siteReview,
  });

  if (!attempt.allowed) {
    return redirect({ href: "/?review=throttled#reviews", locale });
  }

  const { name, rating, comment } = parsed.data;
  await prisma.siteReview.create({
    data: { name, rating, comment, authorId: session.user.id },
  });

  revalidatePath(`/${locale}`);
  return redirect({ href: "/?review=ok#reviews", locale });
}

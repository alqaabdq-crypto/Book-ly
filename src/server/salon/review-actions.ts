"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db/prisma";
import { recomputeSalonRating } from "@/server/salon/rating";

/**
 * Writing a review of a salon.
 *
 * Until now every star on the site was seeded: browse cards, map pins and salon
 * pages all read `Salon.avgRating`, and nothing but a script had ever written a
 * `Review`. This is the write path, and its whole design is the eligibility
 * rule — a marketplace's ratings are worth exactly what it costs to fake one.
 *
 * **You may review a booking if you are the customer on it and the salon has
 * marked it COMPLETED.** That ties a review to a visit that a *second* party
 * agreed happened, so a review cannot be manufactured by either side alone: the
 * customer cannot review a salon they never booked, and a salon cannot invent
 * praise without a real customer account behind a real, completed appointment.
 * One review per booking is enforced by the database (`Review.bookingId` is
 * unique), not only by the check below — the check is for the message, the
 * constraint is for the race.
 */
const localeSchema = z.enum(routing.locales);

const reviewSchema = z.object({
  locale: localeSchema,
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  // Optional on purpose: a rating with no words is still a signal, and demanding
  // prose is how a review form gets abandoned.
  comment: z.string().trim().max(500).optional(),
});

export async function createReview(formData: FormData): Promise<void> {
  const raw = {
    locale: formData.get("locale"),
    bookingId: formData.get("bookingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  };

  const locale = localeSchema.safeParse(raw.locale).data ?? routing.defaultLocale;
  const parsed = reviewSchema.safeParse(raw);

  if (!parsed.success) {
    return redirect({ href: "/account?review=invalid", locale });
  }

  const { bookingId, rating, comment } = parsed.data;

  // Server Actions are reachable by direct POST, so every rule below is checked
  // here rather than only in the page that renders the form.
  const session = await auth();
  if (!session?.user) {
    return redirect({ href: "/auth/login", locale });
  }

  // Scoping by customerId *and* status is the authorisation check: another
  // customer's booking, or one that never happened, simply matches nothing.
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.user.id, status: "COMPLETED" },
    select: { id: true, salonId: true, salon: { select: { slug: true } } },
  });

  if (!booking) {
    return redirect({ href: "/account?review=ineligible", locale });
  }

  const existing = await prisma.review.findUnique({
    where: { bookingId },
    select: { id: true },
  });

  if (existing) {
    return redirect({ href: "/account?review=duplicate", locale });
  }

  try {
    // One transaction: the review and the salon's aggregate move together, so a
    // reader can never see a review that is not yet counted, or a count that
    // includes a review that was rolled back.
    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          bookingId,
          customerId: session.user.id,
          salonId: booking.salonId,
          rating,
          comment: comment && comment.length > 0 ? comment : null,
        },
      });

      await recomputeSalonRating(booking.salonId, tx);
    });
  } catch (error) {
    // The unique constraint firing here means a second submission won the race
    // between the check above and this write — a double-click, not an attack.
    if (error instanceof Error && error.message.includes("bookingId")) {
      return redirect({ href: "/account?review=duplicate", locale });
    }
    throw error;
  }

  // Both surfaces read the numbers this just changed.
  revalidatePath(`/${locale}/account`);
  revalidatePath(`/${locale}/salons/${booking.salon.slug}`);
  revalidatePath(`/${locale}/salons`);

  return redirect({ href: "/account?review=ok", locale });
}

import { beforeEach, describe, expect, it, vi } from "vitest";

// The eligibility rule is what a fake review has to get past, so it is tested
// directly. Prisma, auth and next-intl's redirect are mocked: what is under test
// is which requests are refused, not the database or the router.
const booking = { findFirst: vi.fn() };
const review = { findUnique: vi.fn(), create: vi.fn() };
const $transaction = vi.fn(async (fn: (tx: unknown) => unknown) =>
  fn({ review, salon: { update: vi.fn() } }),
);

vi.mock("@/server/db/prisma", () => ({
  prisma: { booking, review, $transaction: (fn: never) => $transaction(fn) },
}));

const session = vi.fn();
vi.mock("@/server/auth/config", () => ({ auth: () => session() }));

const recompute = vi.fn();
vi.mock("@/server/salon/rating", () => ({
  recomputeSalonRating: (...args: unknown[]) => recompute(...args),
}));

// redirect() throws in Next; here it records where the action tried to send the
// caller, which is how each refusal is identified.
const redirected = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  redirect: (args: { href: string }) => {
    redirected(args.href);
    return undefined;
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { createReview } = await import("@/server/salon/review-actions");

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const VALID = { locale: "en", bookingId: "bk_1", rating: "5", comment: "Great cut" };

describe("createReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.mockResolvedValue({ user: { id: "cust_1", role: "CUSTOMER" } });
    booking.findFirst.mockResolvedValue({
      id: "bk_1",
      salonId: "salon_1",
      salon: { slug: "rose-beauty-lounge" },
    });
    review.findUnique.mockResolvedValue(null);
  });

  it("writes the review and recomputes the salon's rating in one transaction", async () => {
    await createReview(form(VALID));

    expect(review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: "bk_1",
        customerId: "cust_1",
        salonId: "salon_1",
        rating: 5,
        comment: "Great cut",
      }),
    });
    // Same tx client as the create — a review that is not counted is a bug the
    // UI would show as a stale average.
    expect(recompute).toHaveBeenCalledWith("salon_1", expect.anything());
    expect(redirected).toHaveBeenCalledWith("/account?review=ok");
  });

  it("only looks for a booking the caller owns and the salon completed", async () => {
    await createReview(form(VALID));

    expect(booking.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "bk_1", customerId: "cust_1", status: "COMPLETED" },
      }),
    );
  });

  it("refuses when no such booking is the caller's and completed", async () => {
    booking.findFirst.mockResolvedValue(null);

    await createReview(form(VALID));

    expect(review.create).not.toHaveBeenCalled();
    expect(redirected).toHaveBeenCalledWith("/account?review=ineligible");
  });

  it("refuses a second review of the same visit", async () => {
    review.findUnique.mockResolvedValue({ id: "rev_1" });

    await createReview(form(VALID));

    expect(review.create).not.toHaveBeenCalled();
    expect(redirected).toHaveBeenCalledWith("/account?review=duplicate");
  });

  it("sends a signed-out caller to log in, without reading any booking", async () => {
    session.mockResolvedValue(null);

    await createReview(form(VALID));

    expect(booking.findFirst).not.toHaveBeenCalled();
    expect(redirected).toHaveBeenCalledWith("/auth/login");
  });

  it("rejects a rating outside 1–5 before touching the database", async () => {
    await createReview(form({ ...VALID, rating: "9" }));

    expect(booking.findFirst).not.toHaveBeenCalled();
    expect(redirected).toHaveBeenCalledWith("/account?review=invalid");
  });

  it("stores a rating with no words as a null comment, not an empty string", async () => {
    await createReview(form({ locale: "en", bookingId: "bk_1", rating: "4" }));

    expect(review.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ rating: 4, comment: null }),
    });
  });
});

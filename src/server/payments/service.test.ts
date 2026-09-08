import { beforeEach, describe, expect, it, vi } from "vitest";

// The settlement path is the one place in the codebase where an outside party's
// numbers become our numbers, so it is tested against a fake gateway payload
// rather than only through the pure helpers underneath it. Prisma and the
// booking state machine are mocked: what is under test is the decision, not the
// database.
const payment = {
  findUnique: vi.fn(),
  update: vi.fn(),
};

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    payment,
    booking: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

const setBookingStatus = vi.fn();
vi.mock("@/server/booking/status", () => ({
  setBookingStatus: (...args: unknown[]) => setBookingStatus(...args),
}));

const { settleFromGateway } = await import("@/server/payments/service");

/** 150.00 SAR invoiced, as the database stores it. */
function ourPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: "pay_1",
    status: "PENDING",
    amount: { toString: () => "150.00" },
    booking: {
      id: "bk_1",
      status: "PENDING",
      salon: { commissionRate: null, subscription: null },
    },
    ...overrides,
  };
}

function gatewayPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: "moy_1",
    status: "paid",
    amount: 15000,
    refunded: 0,
    invoice_id: "inv_1",
    metadata: { booking_id: "bk_1" },
    ...overrides,
  };
}

describe("settleFromGateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("settles a payment whose amount matches the invoice", async () => {
    payment.findUnique.mockResolvedValue(ourPayment());

    const result = await settleFromGateway(gatewayPayment());

    expect(result).toEqual({ settled: true, bookingId: "bk_1" });
    // 30% of 15000 halalas, written back as the decimal the column stores.
    expect(payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "SUCCEEDED",
          platformFee: "45.00",
          salonNet: "105.00",
        }),
      }),
    );
    expect(setBookingStatus).toHaveBeenCalledWith("bk_1", "CONFIRMED");
  });

  it("refuses an amount that disagrees with what we invoiced", async () => {
    payment.findUnique.mockResolvedValue(ourPayment());

    // A tenth of the price. Without the guard this settles, and the salon is
    // credited 105.00 against a payment of 15.00.
    const result = await settleFromGateway(gatewayPayment({ amount: 1500 }));

    expect(result).toEqual({ settled: false, bookingId: "bk_1" });
    expect(payment.update).not.toHaveBeenCalled();
    expect(setBookingStatus).not.toHaveBeenCalled();
  });

  it("refuses an overpayment too, not just a shortfall", async () => {
    payment.findUnique.mockResolvedValue(ourPayment());

    const result = await settleFromGateway(gatewayPayment({ amount: 150000 }));

    expect(result.settled).toBe(false);
    expect(payment.update).not.toHaveBeenCalled();
  });

  it("is idempotent: a repeated webhook does not rewrite the fee", async () => {
    payment.findUnique.mockResolvedValue(ourPayment({ status: "SUCCEEDED" }));

    const result = await settleFromGateway(gatewayPayment());

    expect(result.settled).toBe(true);
    // The commission was frozen at capture; a second delivery must not recompute
    // it against a rate that may have changed since.
    expect(payment.update).not.toHaveBeenCalled();
    expect(setBookingStatus).toHaveBeenCalledWith("bk_1", "CONFIRMED");
  });

  it("ignores a payload carrying no booking id", async () => {
    const result = await settleFromGateway(gatewayPayment({ metadata: null }));

    expect(result).toEqual({ settled: false });
    expect(payment.findUnique).not.toHaveBeenCalled();
  });

  it("marks a failed payment failed without touching the booking", async () => {
    payment.findUnique.mockResolvedValue(ourPayment());

    const result = await settleFromGateway(
      gatewayPayment({ status: "failed", amount: 15000 }),
    );

    expect(result.settled).toBe(false);
    expect(payment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "FAILED" }) }),
    );
    expect(setBookingStatus).not.toHaveBeenCalled();
  });
});

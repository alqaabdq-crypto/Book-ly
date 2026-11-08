import { beforeEach, describe, expect, it, vi } from "vitest";

// The lifecycle handler decides what a Salla event does to our row; Prisma and
// the store-info call are mocked, so what is under test is the decision.
const sallaStore = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({ prisma: { sallaStore } }));

vi.mock("@/server/salla/client", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/server/salla/client")>();
  return { ...real, fetchStoreInfo: vi.fn().mockResolvedValue({ name: "متجر تجريبي", domain: null }) };
});

const { handleSallaEvent, eventTime } = await import("@/server/salla/events");
const { decryptToken } = await import("@/server/salla/crypto");
const { expiryFrom, toServiceProduct } = await import("@/server/salla/client");

beforeEach(() => {
  process.env.SALLA_TOKEN_KEY = Buffer.alloc(32, 3).toString("base64");
  vi.clearAllMocks();
  sallaStore.upsert.mockResolvedValue({ id: "st_1" });
});

const authorize = {
  event: "app.store.authorize",
  merchant: 1234509876,
  created_at: "2026-11-08 12:00:00",
  data: {
    access_token: "acc_1",
    refresh_token: "ref_1",
    expires: 1797000000,
    scope: "settings.read offline_access",
    token_type: "bearer",
  },
};

describe("app.store.authorize", () => {
  it("stores the tokens encrypted, keyed by the Salla store id", async () => {
    sallaStore.findUnique.mockResolvedValue(null);

    await expect(handleSallaEvent(authorize)).resolves.toBe("applied");

    const call = sallaStore.upsert.mock.calls[0][0];
    expect(call.where).toEqual({ merchantId: "1234509876" });
    expect(call.create.accessTokenEnc).not.toContain("acc_1");
    expect(decryptToken(call.create.accessTokenEnc)).toBe("acc_1");
    expect(decryptToken(call.create.refreshTokenEnc)).toBe("ref_1");
    expect(call.create.tokenExpiresAt).toEqual(new Date(1797000000 * 1000));
    expect(call.create.uninstalledAt).toBeNull();
  });

  it("ignores a retried authorize older than the uninstall that followed it", async () => {
    sallaStore.findUnique.mockResolvedValue({ lastEventAt: eventTime("2026-11-08 12:10:00") });

    await expect(handleSallaEvent(authorize)).resolves.toBe("stale");
    expect(sallaStore.upsert).not.toHaveBeenCalled();
  });

  it("ignores an authorize without a token", async () => {
    sallaStore.findUnique.mockResolvedValue(null);
    await expect(handleSallaEvent({ ...authorize, data: {} })).resolves.toBe("ignored");
  });
});

describe("app.uninstalled", () => {
  it("drops the tokens and the salon link", async () => {
    sallaStore.findUnique.mockResolvedValue({ lastEventAt: eventTime("2026-11-08 12:00:00") });

    await handleSallaEvent({ event: "app.uninstalled", merchant: 1234509876, created_at: "2026-11-08 13:00:00" });

    const data = sallaStore.update.mock.calls[0][0].data;
    expect(data).toMatchObject({ accessTokenEnc: null, refreshTokenEnc: null, salonId: null, linkedAt: null });
    expect(data.uninstalledAt).toEqual(eventTime("2026-11-08 13:00:00"));
  });

  it("is a no-op for a store we never saw", async () => {
    sallaStore.findUnique.mockResolvedValue(null);
    await expect(handleSallaEvent({ event: "app.uninstalled", merchant: 9 })).resolves.toBe("ignored");
  });
});

describe("helpers", () => {
  it("reads expires as a timestamp or a lifetime", () => {
    const now = Date.UTC(2026, 10, 8);
    expect(expiryFrom(1797000000, now)).toEqual(new Date(1797000000 * 1000));
    expect(expiryFrom(1209599, now)).toEqual(new Date(now + 1209599 * 1000));
    expect(expiryFrom(undefined, now)).toBeNull();
  });

  it("keeps only priced service and booking products", () => {
    expect(toServiceProduct({ id: 5, name: " قص شعر ", type: "service", price: { amount: 80 } })).toEqual({
      id: "5",
      name: "قص شعر",
      price: 80,
    });
    expect(toServiceProduct({ id: 6, name: "Mug", type: "product", price: { amount: 30 } })).toBeNull();
    expect(toServiceProduct({ id: 7, name: "Free", type: "booking", price: 0 })).toBeNull();
  });

  it("ignores unknown events", async () => {
    sallaStore.findUnique.mockResolvedValue(null);
    await expect(handleSallaEvent({ event: "app.trial.started", merchant: 1 })).resolves.toBe("ignored");
  });
});

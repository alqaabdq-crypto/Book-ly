import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  decryptToken,
  encryptToken,
  signLinkTicket,
  verifyLinkTicket,
  verifyWebhook,
} from "@/server/salla/crypto";

const KEY = Buffer.alloc(32, 7).toString("base64");
const SECRET = "whsec_test_secret";

beforeEach(() => {
  process.env.SALLA_TOKEN_KEY = KEY;
  process.env.SALLA_WEBHOOK_SECRET = SECRET;
});

describe("token encryption", () => {
  it("round-trips and never stores the plain token", () => {
    const sealed = encryptToken("ory_at_abc123");
    expect(sealed).not.toContain("ory_at_abc123");
    expect(decryptToken(sealed)).toBe("ory_at_abc123");
  });

  it("uses a fresh IV each time", () => {
    expect(encryptToken("same")).not.toBe(encryptToken("same"));
  });

  it("rejects a tampered value", () => {
    const [v, iv, tag, data] = encryptToken("ory_at_abc123").split(".");
    const flipped = Buffer.from(data, "base64url");
    flipped[0] ^= 1;
    expect(() => decryptToken([v, iv, tag, flipped.toString("base64url")].join("."))).toThrow();
  });

  it("refuses a key of the wrong length", () => {
    process.env.SALLA_TOKEN_KEY = Buffer.alloc(16).toString("base64");
    expect(() => encryptToken("x")).toThrow(/32 bytes/);
  });
});

describe("webhook verification", () => {
  const body = '{"event":"app.store.authorize","merchant":1234509876}';
  const sig = createHmac("sha256", SECRET).update(body).digest("hex");

  it("accepts Salla's HMAC-SHA256 hex signature over the raw body", () => {
    expect(verifyWebhook(body, { strategy: "Signature", signature: sig, authorization: null })).toBe(true);
  });

  it("rejects a signature over different bytes", () => {
    const reserialised = JSON.stringify(JSON.parse(body), null, 1);
    expect(verifyWebhook(reserialised, { strategy: "Signature", signature: sig, authorization: null })).toBe(false);
  });

  it("rejects a missing signature", () => {
    expect(verifyWebhook(body, { strategy: null, signature: null, authorization: null })).toBe(false);
  });

  it("supports the Token strategy", () => {
    expect(verifyWebhook(body, { strategy: "Token", signature: null, authorization: SECRET })).toBe(true);
    expect(verifyWebhook(body, { strategy: "Token", signature: null, authorization: "Bearer " + SECRET })).toBe(true);
    expect(verifyWebhook(body, { strategy: "Token", signature: null, authorization: "nope" })).toBe(false);
  });

  it("rejects everything when the secret is unset", () => {
    delete process.env.SALLA_WEBHOOK_SECRET;
    expect(verifyWebhook(body, { strategy: "Signature", signature: sig, authorization: null })).toBe(false);
  });
});

describe("link tickets", () => {
  it("vouches for the merchant it was signed for", () => {
    expect(verifyLinkTicket(signLinkTicket("1234509876"))).toBe("1234509876");
  });

  it("expires after 30 minutes", () => {
    const t0 = Date.UTC(2026, 10, 8, 12);
    const ticket = signLinkTicket("1", t0);
    expect(verifyLinkTicket(ticket, t0 + 29 * 60_000)).toBe("1");
    expect(verifyLinkTicket(ticket, t0 + 31 * 60_000)).toBeNull();
  });

  it("rejects an edited merchant id", () => {
    const [, mac] = signLinkTicket("1").split(".");
    const forged = Buffer.from(JSON.stringify({ m: "2", exp: Date.now() + 60_000 })).toString("base64url");
    expect(verifyLinkTicket(`${forged}.${mac}`)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifyLinkTicket("not-a-ticket")).toBeNull();
    expect(verifyLinkTicket(undefined)).toBeNull();
  });
});

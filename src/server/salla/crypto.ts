import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * The three secrets of the Salla integration, all pure functions so they can be
 * tested without a database or network:
 *
 * - **Token encryption.** Merchant access/refresh tokens are API keys to a
 *   real store; they are stored AES-256-GCM encrypted under SALLA_TOKEN_KEY.
 * - **Webhook authenticity.** Salla signs each delivery with HMAC-SHA256 over
 *   the request body, hex encoded, in `X-Salla-Signature` (the "Signature"
 *   strategy, the default for partner apps). The "Token" strategy sends the
 *   secret itself in `Authorization`; both are checked in constant time.
 * - **Link tickets.** Proof, carried from the Salla-embedded app page to a
 *   Book-ly tab, that the person linking is signed in to that Salla store.
 */

const TICKET_TTL_MS = 30 * 60 * 1000;

function tokenKey(): Buffer {
  const raw = process.env.SALLA_TOKEN_KEY;
  if (!raw) throw new Error("SALLA_TOKEN_KEY is not set");

  // 32 bytes, accepted as base64 (what `openssl rand -base64 32` prints) or hex.
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("SALLA_TOKEN_KEY must be 32 bytes (base64 or hex)");
  return key;
}

/** A sub-key per purpose, so the ticket signer never shares a key with the cipher. */
function derived(purpose: string): Buffer {
  return createHmac("sha256", tokenKey()).update(`book-ly/salla/${purpose}`).digest();
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// ------------------------------------------------------------- tokens ----

/** `v1.<iv>.<tag>.<ciphertext>`, each part base64url. */
export function encryptToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", derived("token-cipher"), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv, tag, data].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

/** Throws on a tampered or foreign value: GCM's tag check is the integrity test. */
export function decryptToken(sealed: string): string {
  const [version, iv, tag, data] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || data === undefined) throw new Error("Malformed sealed token");

  const decipher = createDecipheriv("aes-256-gcm", derived("token-cipher"), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}

// ----------------------------------------------------------- webhooks ----

/**
 * True only when the delivery carries our secret. `rawBody` must be the exact
 * bytes received: re-serialising parsed JSON (as Salla's own Node sample does)
 * changes spacing and escaping, and the signature stops matching.
 */
export function verifyWebhook(
  rawBody: string,
  headers: { strategy: string | null; signature: string | null; authorization: string | null },
): boolean {
  const secret = process.env.SALLA_WEBHOOK_SECRET;
  // An unset secret rejects everything: accepting unsigned events would let
  // anyone install, link or uninstall any store.
  if (!secret) return false;

  if (headers.strategy?.toLowerCase() === "token") {
    const supplied = (headers.authorization ?? "").replace(/^Bearer\s+/i, "");
    return supplied.length > 0 && safeEqual(supplied, secret);
  }

  if (!headers.signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return safeEqual(headers.signature.trim().toLowerCase(), expected);
}

// ------------------------------------------------------------ tickets ----

/** `<payload>.<mac>`; the payload names the Salla store and an expiry. */
export function signLinkTicket(merchantId: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ m: merchantId, exp: now + TICKET_TTL_MS })).toString("base64url");
  const mac = createHmac("sha256", derived("link-ticket")).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

/** The merchant id the ticket vouches for, or null if forged, garbled or expired. */
export function verifyLinkTicket(ticket: string | undefined | null, now = Date.now()): string | null {
  if (!ticket) return null;
  const [payload, mac] = ticket.split(".");
  if (!payload || !mac) return null;

  const expected = createHmac("sha256", derived("link-ticket")).update(payload).digest("base64url");
  if (!safeEqual(mac, expected)) return null;

  try {
    const { m, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { m?: unknown; exp?: unknown };
    if (typeof m !== "string" || typeof exp !== "number" || exp < now) return null;
    return m;
  } catch {
    return null;
  }
}

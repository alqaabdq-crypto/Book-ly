import { NextResponse } from "next/server";
import { verifyWebhook } from "@/server/salla/crypto";
import { handleSallaEvent, type SallaEvent } from "@/server/salla/events";

/**
 * Salla's app webhook: the URL to put in the Salla Partners portal under the
 * app's Webhook URL. With "Easy mode" OAuth (the only mode published apps may
 * use) this is also how tokens arrive, in `app.store.authorize`.
 *
 * Outside the locale proxy (its matcher skips `/api`), so the URL never gains a
 * locale prefix.
 */
export async function POST(request: Request) {
  // The exact bytes Salla signed: parsing and re-serialising would change them.
  const raw = await request.text();

  const authentic = verifyWebhook(raw, {
    strategy: request.headers.get("x-salla-security-strategy"),
    signature: request.headers.get("x-salla-signature"),
    authorization: request.headers.get("authorization"),
  });
  if (!authentic) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SallaEvent;
  try {
    body = JSON.parse(raw) as SallaEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 200 for events we skip: a non-2xx makes Salla retry, and retrying will not
  // make an unknown or stale event useful.
  const outcome = await handleSallaEvent(body);
  return NextResponse.json({ received: true, event: body.event ?? null, outcome });
}

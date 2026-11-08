import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { introspectEmbeddedToken } from "@/server/salla/client";
import { signLinkTicket } from "@/server/salla/crypto";

/**
 * Called by the Salla-embedded app page (src/components/salla-embedded.tsx)
 * with the short-lived token the Salla dashboard put on its iframe URL.
 *
 * The token is only trusted after Salla's introspection confirms it; then the
 * answer is the store's state and, when it is installed, a signed link ticket.
 * 401 tells the page to ask the dashboard for a fresh token.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

  const merchantId = await introspectEmbeddedToken(token).catch(() => null);
  if (!merchantId) return NextResponse.json({ error: "Unverified" }, { status: 401 });

  const store = await prisma.sallaStore.findUnique({
    where: { merchantId },
    select: { uninstalledAt: true, accessTokenEnc: true, salon: { select: { nameAr: true, nameEn: true } } },
  });

  if (!store || store.uninstalledAt || !store.accessTokenEnc) {
    return NextResponse.json({ state: "waiting" }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    {
      state: "installed",
      ticket: signLinkTicket(merchantId),
      linked: store.salon ? { ar: store.salon.nameAr, en: store.salon.nameEn } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

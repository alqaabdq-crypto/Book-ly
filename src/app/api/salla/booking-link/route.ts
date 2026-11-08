import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";

const CORS = {
  // Called from merchants' storefronts (any Salla domain or a custom one) by
  // the app snippet. It answers only public facts: a salon's public page.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * `GET /api/salla/booking-link?store=<salla store id>` → `{ url }` of the linked
 * salon's booking page, or 404 when the store is not installed, not linked, or
 * the salon is not live yet. The snippet shows its "احجز موعدك" button only on
 * a 200, so a half-set-up salon never sends customers to a dead end.
 */
export async function GET(request: NextRequest) {
  const store = request.nextUrl.searchParams.get("store")?.trim();
  const lang = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "ar";

  if (!store || !/^\d{1,20}$/.test(store)) {
    return NextResponse.json({ error: "Bad store id" }, { status: 400, headers: CORS });
  }

  const row = await prisma.sallaStore.findUnique({
    where: { merchantId: store },
    select: { uninstalledAt: true, salon: { select: { slug: true, status: true } } },
  });

  if (!row || row.uninstalledAt || !row.salon || row.salon.status !== "APPROVED") {
    return NextResponse.json({ error: "Not linked" }, { status: 404, headers: CORS });
  }

  const url = new URL(`/${lang}/salons/${row.salon.slug}`, request.url).toString();
  return NextResponse.json(
    { url },
    { headers: { ...CORS, "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}

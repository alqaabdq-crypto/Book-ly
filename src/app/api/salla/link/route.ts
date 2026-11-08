import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { verifyLinkTicket } from "@/server/salla/crypto";
import { SALLA_LINK_COOKIE } from "@/server/salla/link";

/**
 * The hand-off from the Salla-embedded app page to a normal Book-ly tab.
 *
 * The embedded page lives in an iframe inside the Salla dashboard, where our
 * sign-in cookies may be blocked as third-party. So it opens this URL in a new
 * top-level tab with a signed ticket; we park the ticket in a first-party,
 * httpOnly cookie and send the owner to the Salla page of their dashboard. The
 * cookie survives a detour through sign-in or registration, and the link itself
 * is only made by a server action that re-verifies the ticket.
 */
export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get("ticket");
  const wanted = request.nextUrl.searchParams.get("locale");
  const locale = routing.locales.includes(wanted as (typeof routing.locales)[number])
    ? wanted
    : "ar";

  const target = new URL(`/${locale}/owner/salla`, request.url);

  if (!verifyLinkTicket(ticket)) {
    target.searchParams.set("error", "ticket");
    return NextResponse.redirect(target);
  }

  const response = NextResponse.redirect(target);
  response.cookies.set(SALLA_LINK_COOKIE, ticket!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60,
  });
  return response;
}

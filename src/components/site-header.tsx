import { getTranslations } from "next-intl/server";
import { auth } from "@/server/auth/config";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LogoutButton } from "@/components/logout-button";
import { BrandMark } from "@/components/brand-mark";
import { LogoLockup } from "@/components/logo-lockup";
import { Wordmark } from "@/components/wordmark";
import type { Role } from "@/generated/prisma/client";

const dashboardPathByRole: Record<Role, string> = {
  CUSTOMER: "/account",
  SALON_OWNER: "/owner",
  ADMIN: "/admin",
};

// Reads the session, so every page under this layout renders dynamically. That's
// the right trade for a marketplace where the header is always account-aware —
// and with the JWT strategy this is cookie verification, not a database round-trip.
export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-background/70 backdrop-blur-md">
      {/* whitespace-nowrap throughout: at 393px this nav is tight enough that
          flex will otherwise break "book-ly" and "Log out" across two lines
          mid-phrase. Wrapping the row is fine; wrapping a label is not. */}
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 p-4 sm:gap-x-4">
        <LogoLockup href="/" className="flex items-center gap-2 rounded-xl whitespace-nowrap">
          <BrandMark className="h-6 w-6" />
          {/* Two faces: a Minion-class serif for "book", Anton for "-ly". The
              display half is set a step down — Anton is condensed and tall, so
              matching the serif's px would make it read larger, not equal.
              Hovering or focusing the link snips the shears and sweeps the
              gradient across the name; see .logo-lockup in globals.css. */}
          <Wordmark text={t("brand")} size={{ serif: "text-xl", display: "text-lg" }} />
        </LogoLockup>
        <Link
          href="/salons"
          className="text-sm font-medium whitespace-nowrap text-muted transition hover:text-brand"
        >
          {t("salons")}
        </Link>
        <Link
          href="/help"
          className="text-sm font-medium whitespace-nowrap text-muted transition hover:text-brand"
        >
          {t("help")}
        </Link>

        <div className="ms-auto flex items-center gap-3">
          <LocaleSwitcher />
          {session?.user ? (
            <>
              <Link
                href={dashboardPathByRole[session.user.role]}
                className="text-sm font-medium whitespace-nowrap text-muted transition hover:text-brand"
              >
                {t("dashboard")}
              </Link>
              <LogoutButton className="px-4 py-1.5 text-sm whitespace-nowrap" />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium whitespace-nowrap text-muted transition hover:text-brand"
              >
                {t("login")}
              </Link>
              <Link
                href="/auth/register"
                className="btn-brand rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

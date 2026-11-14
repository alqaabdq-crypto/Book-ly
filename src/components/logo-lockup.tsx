import { Link } from "@/i18n/navigation";

// The logo's wrapper: one hover/focus/press target for the chip and the name,
// so the whole lockup reacts as one unit. The behaviour itself is CSS only, in
// globals.css (`.logo-lockup`): the shears close, the chip grows a little and
// glows, the gradient sweeps across the name and the last letter kicks up.
//
// It used to tilt the chip toward the pointer in 3D; that was removed at the
// owner's request (2026-11-14), which is why this no longer needs to be a
// client component.
export function LogoLockup({
  href,
  className = "",
  children,
}: {
  /** Renders a Link when set, a plain span when not — the hero's app bar is a
      mock, and a logo inside it must not be a second link to the home page. */
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const cls = `logo-lockup ${className}`;
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

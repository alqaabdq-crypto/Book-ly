"use client";

import { useCallback, useRef } from "react";
import { Link } from "@/i18n/navigation";

// The logo's 3D behaviour: the chip tilts toward the cursor, the shears float
// above its face, and a specular highlight tracks the pointer across it.
//
// The component's whole job is to turn pointer position into four CSS custom
// properties — two rotations and the highlight's x/y — and let globals.css do
// the drawing. Nothing here is React state: a pointermove handler that called
// setState would re-render the header on every mouse event, and the header
// reads the session, so that is not a cheap render. Writing straight to the
// node's style is the same technique the hero parallax uses.
//
// It degrades in two directions, and both matter. With JS disabled the custom
// properties never change, they resolve to their 0 defaults, and the CSS-only
// hover state — the shears closing, the gradient sweep — still runs. With
// `prefers-reduced-motion: reduce` the CSS drops every transform, and the values
// this writes are simply ignored.
const MAX_TILT = 16;

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
  const ref = useRef<HTMLElement>(null);

  const track = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const node = ref.current;
    if (!node) return;

    const box = node.getBoundingClientRect();
    // -1 at the left/top edge, +1 at the right/bottom.
    const x = ((event.clientX - box.left) / box.width) * 2 - 1;
    const y = ((event.clientY - box.top) / box.height) * 2 - 1;

    // rotateX is inverted: pushing the pointer down should tip the top of the
    // chip away from the viewer, not toward it.
    node.style.setProperty("--rx", `${(-y * MAX_TILT).toFixed(2)}deg`);
    node.style.setProperty("--ry", `${(x * MAX_TILT).toFixed(2)}deg`);
    node.style.setProperty("--gx", `${(((x + 1) / 2) * 100).toFixed(1)}%`);
    node.style.setProperty("--gy", `${(((y + 1) / 2) * 100).toFixed(1)}%`);
  }, []);

  const release = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    // Clearing the properties rather than zeroing them hands the element back to
    // the stylesheet, so the eased return home is described in one place.
    for (const name of ["--rx", "--ry", "--gx", "--gy"]) {
      node.style.removeProperty(name);
    }
  }, []);

  const props = {
    ref: ref as never,
    className: `logo-lockup ${className}`,
    onPointerMove: track,
    onPointerLeave: release,
    // A touch tap should not leave the logo stuck mid-tilt.
    onPointerCancel: release,
    onBlur: release,
  };

  return href ? (
    <Link href={href} {...props}>
      {children}
    </Link>
  ) : (
    <span {...props}>{children}</span>
  );
}

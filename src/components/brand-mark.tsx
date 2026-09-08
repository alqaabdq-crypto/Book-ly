// The book-ly mark: a pair of open shears knocked out of the brand chip.
//
// Why shears and not a calendar, a clock or a bookmark — all of which were
// drawn and rejected: the *name* already says booking. A calendar mark repeats
// what "book-ly" has said and leaves the trade unstated; the shears say the part
// the name cannot, and the lockup then carries both halves of the proposition.
// They also survive the size that matters. The header renders this at 24px, and
// at 24px a calendar's slots and a bookmark's notch both close up, while two
// blades and two rings stay legible.
//
// Knocked out of the chip rather than stroked in gradient on the canvas, because
// the header already had a plain gradient chip: this keeps the block of colour
// the layout was built around and spends it on meaning instead. The knockout
// colour is the page background, so the mark is a hole in the chip, not ink on
// it — which is what keeps it working when the chip sits on a light surface.
//
// The two halves are grouped as `shear-a` and `shear-b`, each a blade with the
// ring it actually pivots on — the blade that ends top-right belongs to the ring
// on the *left*, which is how a real pair of shears is hinged. Grouping them any
// other way makes the hover animation look like two loose parts sliding, rather
// than one tool closing. The rotation itself is in globals.css.
export function BrandMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <span
      className={`gradient-brand logo-chip text-background relative inline-flex shrink-0 items-center justify-center rounded-lg shadow-sm ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 32 32"
        className="h-[70%] w-[70%]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Each half: one ring and the blade hinged to it. */}
        <g className="shear-a">
          <circle cx="9.5" cy="24" r="3.6" />
          <path d="M11.8 21.2 L23 6" />
        </g>
        <g className="shear-b">
          <circle cx="22.5" cy="24" r="3.6" />
          <path d="M20.2 21.2 L9 6" />
        </g>
        {/* The pivot. Filled, not stroked: a 1.3-radius ring would silt up at
            16px, which is what this mark is asked to survive. */}
        <circle cx="16" cy="13.6" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

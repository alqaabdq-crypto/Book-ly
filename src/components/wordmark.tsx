// The wordmark is two faces, and the split is the point: "book" is set in a
// Minion-class oldstyle serif, "-ly" in Anton — a condensed poster face that is
// meant to shout. The hyphen goes with the display half, so the heavy run starts
// on the dash rather than hanging off the end of the serif.
//
// The split is computed from the brand string rather than hard-coded, so a brand
// with no hyphen degrades to a single serif run instead of rendering an empty
// span. Both catalogs carry the same Latin brand, so this behaves identically in
// English and Arabic.
//
// `logo-word` / `logo-word-tail` are the hooks the hover behaviour hangs on; the
// animation itself lives in globals.css beside the rest of the lockup, so the
// mark and the name are described in one place.
export function Wordmark({
  text,
  size,
  className = "",
}: {
  text: string;
  /** Tailwind text-* class for each half. The display half is set one step down:
      Kanit Black sets a large x-height, so matching the serif's px makes it read
      larger, not equal. */
  size: { serif: string; display: string };
  className?: string;
}) {
  const at = text.indexOf("-");
  const head = at > 0 ? text.slice(0, at) : text;
  const tail = at > 0 ? text.slice(at) : "";

  return (
    // dir="ltr" is load-bearing, not decoration. This is a flex row, so on the
    // Arabic pages it inherits direction: rtl and lays its two children out
    // right-to-left — the logo rendered "ly-book" until this was added. The brand
    // is a Latin word in both locales, so pinning the run to LTR is also the
    // honest description of it.
    //
    // No gap and no whitespace between the spans: they are one word, and a
    // screen reader must read "book-ly", not "book" then "-ly".
    <span
      dir="ltr"
      className={`text-gradient-brand logo-word inline-flex items-baseline ${className}`}
    >
      <span className={`font-serifmark font-semibold ${size.serif}`}>{head}</span>
      {/* `italic` selects the drawn italic loaded in layout.tsx — without it the
          upright face renders and the whole point of the pairing is lost.
          `font-black` states the 900 that is actually loaded: leaving the span at
          the inherited 400 leaves the browser to match a weight nothing declares,
          and it is the fallback stack that pays for that ambiguity. */}
      {tail && (
        <span className={`logo-word-tail font-wordmark italic font-black ${size.display}`}>
          {tail}
        </span>
      )}
    </span>
  );
}

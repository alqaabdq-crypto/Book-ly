# book-ly — Progress Report

**Last updated:** 2026-09-08

book-ly is a bilingual (English / Arabic, RTL) salon-booking marketplace for
Saudi Arabia. Customers discover and book salons; salon owners manage their
listing, staff and schedule; admins verify salons before they go live.

**Renamed to "book-ly" on 2026-09-05**, having been "Fade" since 2026-08-25 and
"Salon Hub" before that. Entries below those dates say the name of their day, and
are left as written — rewriting history would make the commit messages and the
file disagree. What matters is where an old name still *lives*, not where it is
merely mentioned — see the rename entry immediately below.

---

## ▶ Last request and answer

> **Read this first when reviewing this report, and lead with it.** Standing
> instruction from the project owner: begin a review by stating what was last
> asked for and what the answer was, before anything else.

**Asked (2026-09-08, latest):** *"now please start the name of the project with
capital B."*

**Answered:** The brand is **Book-ly** everywhere a user sees it — both message
catalogs (title, nav brand, the commission hint, the testimonials subtitle, the
support-reply sender), the `<title>`, the Moyasar invoice description that shows
on a card statement, the admin display name in the seed *and* in the live row,
the README and this file's heading. The **GitHub repo was recased to
`Book-ly`** to match; GitHub redirects the old path as before.

**The two-face wordmark takes the capital well, which was the thing to check.**
"Book" is the serif half, so the capital lands in Crimson Pro's B against the
Kanit italic "-ly" — screenshot-verified at header size rather than assumed. The
split logic needed nothing: it cuts on the hyphen, so it now yields "Book" and
"-ly" without being told.

⚠️ **Two things cannot follow the capital, and both are permanent-ish.**

- **npm forbids uppercase in package names.** `package.json` stays `book-ly`.
  This is not a preference — the registry rejects capitals outright, so it will
  never match the brand.
- **The Postgres database, its role and the seeded `@salonhub.sa` logins** still
  carry the *original* name, capital or not, for the reason they always have: a
  re-seed destroys the 42 settled payments.

**The folder case was deliberately left alone.** Windows treats paths
case-insensitively, so recasing `…\claude\book-ly` shows in Explorer and nowhere
else — and a path change is exactly what broke the Prisma client an hour ago.
Not worth re-running that for an invisible capital.

**Verified:** typecheck, lint and 81 tests clean; a rebuild; `<title>` reads
Book-ly and **zero** lowercase `book-ly` remains in the rendered HTML of `/en`;
and the wordmark splits into "Book" + "-ly" across the two faces.

---

**Asked (2026-09-08):** *"rename the folder too."*

**Answered:** Both folders. The project is now
`C:\Users\Admin\OneDrive\Desktop\claude\book-ly`, and its production build copy
is `C:\temp\book-ly-live` — renaming only the first would have left the path that
is actually wired into the tunnel still saying salon-hub.

⚠️ **This broke the running site, and the reason is worth keeping.** Prisma 7
generates its client against a **hashed package identity**
(`@prisma/client-47c0a585693bfa7b`), and that hash moved when the package name
and the directory did. The server came back up 500-ing with *Cannot find module
`@prisma/client-47c0a585693bfa7b/runtime/client`*.

**A rebuild did not fix it, which is the actual lesson.** `npm run build` reran
`prisma generate` and compiled clean — and the server still 500'd with the same
missing hash. The stale name was not in the generated client at all; it was in
**Turbopack's persistent cache** under `.next/cache/turbopack/`, which held the
old external-module reference and kept feeding it back into every rebuild.
`rm -rf .next` and one more build fixed it in a minute. **After renaming a
project directory or its package, delete `.next` — regenerating the Prisma client
is not enough, because the build cache remembers the old name.**

**A second, smaller obstacle:** Git Bash's `mv` refused the project folder with
*Device or resource busy* — a handle somewhere in a OneDrive-synced tree.
PowerShell's `Rename-Item` did it without complaint on the first try.

**Verified after both renames:** git is intact and still pointed at
`alqaabdq-crypto/book-ly` with a clean tree at `ff78a14`; typecheck and 81 tests
pass from the new path; the tunnel serves `/en`, `/ar`, `/en/salons` and
`/en/auth/login` at 200 with the title reading book-ly; and the database is
untouched — 42 settled payments, exactly as before. The tunnel hostname survived
because `cloudflared` was never stopped: it points at `localhost:3111`, and what
moved was only the directory the server starts from.

**The old name now survives in exactly one place:** the Postgres database, its
role, and the seeded `@salonhub.sa` logins. That one cannot change without a
re-seed that destroys the payment data every revenue figure rests on — leave it
until there is real data worth keeping.

---

**Asked (2026-09-08):** *"rename the npm package too."*

**Answered:** Done — `"name": "book-ly"` in `package.json`, and both places the
lockfile repeats it (the root `name` and `packages[""].name`; editing only the
manifest leaves the lockfile disagreeing with it, which `npm install` then
rewrites at an unpredictable moment).

**Nothing depends on this name, which is why it was safe.** Nothing in `src/`,
`scripts/` or `prisma/` reads it, the package is `"private": true` and has never
been published, and its only visible effect is the prefix npm prints on script
output — now `book-ly@0.1.0 test` instead of `salon-hub@0.1.0 test`. Re-verified
after the change: typecheck, lint and 81 tests clean, and `npm install` was a
no-op beyond the rename, so no dependency was disturbed.

**The old name now survives in exactly two places, and only one of them matters:**
the working folder (`…\Desktop\claude\salon-hub`, whose build copy
`C:\temp\salon-hub-live` is wired into the tunnel and every deployment note), and
the **Postgres database, its role, and the seeded `@salonhub.sa` logins** — which
cannot change without a re-seed that destroys the 42 settled payments every
revenue figure in this document rests on. The folder is a rename plus two path
updates whenever it is wanted; the database should wait for real data.

---

**Asked (2026-09-08):** *"rename the repo to book-ly."*

**Answered:** Done — **`github.com/alqaabdq-crypto/book-ly`**. This is the
decision that was offered on 2026-08-25 and declined then; it is now taken.

**Nothing breaks, and one thing is worth knowing about why.** GitHub redirects
the old path, so an existing clone keeps fetching and pushing untouched, and the
local remote was rewritten to the new URL by the rename itself. **But a redirect
is a courtesy, not a guarantee** — and it stops working the moment anyone creates
a new repository under the old name. Anything written down (CI config, a bookmark,
a badge) should be moved rather than left leaning on it.

⚠️ **The old name is still in three places, and each has a different reason:**

- **The npm package** is still `salon-hub` in `package.json`. Nothing publishes
  it, so it is cosmetic — say the word and it changes.
- **The working folder** is still `…\Desktop\claude\salon-hub`, and its build copy
  `C:\temp\salon-hub-live` is wired into the tunnel and the deployment notes.
  Renaming it means re-pointing both.
- **The Postgres database, its role, and the seeded `@salonhub.sa` logins** stay,
  and this one is not cosmetic: changing them means a re-seed, which destroys the
  42 settled payments every revenue figure in this document rests on.

`README.md` and the two places in this file that describe the *current* repo were
updated. Historical entries keep the name they were written with — rewriting them
would make the commit messages and the document disagree.

---

**Asked (2026-09-08):** *"update the progress report with the new
updates"* — and, mid-run, *"and github"*.

**Answered:** The per-request entries were **already current** — the blocker
entry below was written as that work finished. So, as on 2026-08-26 when this
same request came, the pass went looking for what was actually stale, and found
it in the parts that describe *state* rather than *history*:

- **Two "open issues" were describing a product that no longer exists.** "Salon
  cover images are modelled but nothing renders them" — covers and staff avatars
  have rendered since 2026-08-07; what is actually unbuilt is the multi-photo
  gallery. And "a booking stays PENDING forever" — the owner dashboard has moved
  bookings through CONFIRMED/COMPLETED/NO_SHOW since M4, and COMPLETED is now
  what gates the review form. Both corrected in place, struck rather than
  deleted, so the original claim and its expiry stay visible.
- **"Customers still cannot write salon reviews" was the headline of "What is
  genuinely not done", and it is closed.** Replaced with what is *still* true and
  easy to miss: the write path exists, but every rating on the site today is
  still seeded, because no real customer has used it yet.
- **Four new open issues were recorded**, none of them obvious from the code:
  rate limiting covers four paths and not every write; the limiter fails open by
  design; five `npm audit` highs remain inside the Prisma CLI's dependencies and
  `--force` would downgrade Prisma; and there is still no email verification or
  password reset, both of which wait on a mail provider.
- **M15 added** to the milestone table for the launch-hardening work.
- **Two environment traps added** — `npm audit fix --force` proposing a major
  version *backwards*, and the build copy needing `npm run build` rather than
  `npx next build` after a schema change, because only the former runs
  `prisma generate` and the copy's client goes stale.

**And "and github": fourteen days of uncommitted work is now pushed.** Three
commits on `master`, fast-forwarded to `origin/main`:

- **`e14e75c`** — the rebrand and the identity: book-ly in both locales, the
  two-face wordmark, the shears mark, the 3D lockup, the site icon.
- **`d1ba741`** — the five closed launch blockers: the settlement amount check,
  the dependency upgrades, customer reviews, the locked-down review form, rate
  limiting.
- this documentation pass.

**Checked before pushing, because the repo is public:** `.env` is covered by
`.gitignore` (`.env*`), the generated Prisma client is ignored, and a scan of the
whole diff for keys, tokens and private-key headers found one hit — the string
`sk_test_…` in this file's own prose about *getting* Moyasar keys.

⚠️ **The repo is still named `salon-hub`** and so is the npm package, so a clone
gets a project called Salon Hub whose UI says book-ly. That was declined once on
2026-08-25 and stands as the only stale thing about the published repository.

---

**Asked (2026-09-08):** *"start on the blockers."*

**Answered: five of the ten are closed.** New URL —
**`https://happiness-award-arthritis-restructuring.trycloudflare.com`** (the
2026-09-05 hostname expired over the three idle days; quick tunnels do that).

**1. The webhook no longer trusts the gateway's amount.** `settleFromGateway`
compares `gateway.amount` against `sarToHalalas(payment.amount)` before it writes
anything, and **refuses** on a mismatch rather than correcting it — a partial
capture or a wrong currency is something a human should see, not something to
paper over. The shared secret proves the *sender*; this proves the *contents*.

**2. The critical CVE is gone, and the highs that reach the request path with
it.** Targeted upgrades, deliberately **not** `npm audit fix --force`, which
proposed **downgrading Prisma from 7 to 6**: `next` 16.2.10 → **16.3.4**,
`next-auth` beta.31 → **beta.32** (pulls `@auth/core` past the critical email
homoglyph bypass), `sharp` 0.34.5 → **0.35.4** (it processes untrusted uploads),
Prisma 7.8 → **7.10**. Production advisories went **15 (2 critical, 9 high) → 5,
0 critical**. ⚠️ **The remaining 5 are all inside the `prisma` CLI's own
dependencies** — `@prisma/config`→`deepmerge-ts`, `mysql2`, `nanoid` — reachable
at `prisma generate` / `migrate` time, not from a request, and the only fix is
Prisma 8, which is a release candidate. **Not taking an RC into production for
build-time advisories** is the call; revisit when 8 is stable.

**3. Customers can write reviews.** `createReview` in
`src/server/salon/review-actions.ts`, with the form on each past booking in
`/account`. **The eligibility rule is the design:** you may review a booking if
you are the customer on it *and the salon has marked it COMPLETED*. That ties
every review to a visit a **second party** agreed happened — a customer cannot
review a salon they never booked, and a salon cannot invent praise without a real
account behind a real completed appointment. One review per booking, enforced by
the unique constraint as well as the check, and the review plus
`recomputeSalonRating` run **in one transaction**, so no reader sees a review
that is not yet counted. Every star on the site is no longer necessarily seeded.

**4. The site-review form now needs an account.** It was open submission
publishing straight to the landing page — proved live when a stranger's review
arrived through it on 2026-09-05. Now: sign-in required, **3 per account per
day**, and the row records `authorId`, so a bad review can be traced rather than
merely deleted. Signed-out visitors get an invitation to sign in instead of a
form whose submission would be thrown away. The column is **nullable on purpose**
— a null marks the rows written while it was open.

**5. Rate limiting exists, counted in Postgres.** `src/server/security/rate-limit.ts`,
applied to login (8 per email per 15 min), registration (5 per IP per hour),
booking (12 per account per hour — a PENDING booking holds staff for 20 minutes,
so an unthrottled account could freeze a salon's day) and site reviews.
**In the database rather than a Map** because the app is meant to run several
instances and a per-process counter gives each one its own private allowance.
The whole check is a **single upsert** that both resets an expired window and
increments a live one — read-then-write in application code is how you build a
limiter that does not limit. It **fails open** if the table misbehaves: every
caller behind it still has its own authorisation check, and a limiter that fails
closed locks everyone out of the site.

⚠️ **The first cut counted attempts, not failures** — the verification run caught
it: a successful login had burned a slot, so a person signing in on a phone, a
laptop and a tablet spends the same budget an attacker does. A successful
credential check now clears the window.

**Verified, and the login test is the one worth keeping:** eight wrong passwords
then the **correct** one — refused, proving the refusal comes from the limit and
not the password, and it returns the same `CredentialsSignin` as a wrong password
so it tells an attacker nothing. Then five failures followed by the correct
password — **signed in**, window cleared. End to end on the review path: a
throwaway customer with a COMPLETED booking saw the form, posted 4★, landed on
`?review=ok`, the row appeared with its `customerId`, Glow Studio's aggregate
moved 2 → 3 reviews, and the form was gone on reload with "Your review" in its
place. Signed out, the landing page shows the sign-in prompt and **no form**.
Typecheck, lint and **81 tests** (was 68) clean; a migration that is purely
additive — the 42 settled payments and both site reviews survived it.

**All test data was removed afterwards** — the throwaway user, its booking and
review, and the rate-limit rows — and the salon aggregates were recomputed back
to 4.75/4, 4.33/3 and 4.00/2.

**Still open, and why:** deployment and Moyasar need accounts only the owner has;
**payouts** need a commercial decision before code (who settles, on what cycle,
under which SAMA arrangement); **VAT/ZATCA and the legal pages** need real
numbers and, honestly, an accountant; **notifications** need an email or SMS
provider chosen and paid for. Those five are the remaining blockers.

---

**Asked (2026-09-05):** *"please look deeply into the code of this project
and all aspects of this project and then tell me if it is ready for launch?"*

**Answered: no — and the gap is not code quality.** The engineering holds up under
reading. What is missing is nearly everything between "works on a laptop" and
"takes money from strangers." Ten blockers, found by reading the source rather
than this file:

1. **Never deployed.** A Cloudflare quick tunnel to a laptop that dies when the
   machine sleeps. No host, no managed database, no backups, no monitoring.
2. **Moyasar has never been called.** Every payment path is verified against our
   own webhook handler with seeded rows. The API call itself is unproven.
3. **No payout path exists.** `Payout` is a table nothing writes — `grep` finds no
   create anywhere in `src/`. The platform would collect 100% of customer money
   with no mechanism to pay salons; the owner revenue page's "awaiting payout" is
   every payment ever taken. Holding third-party funds this way is a SAMA
   question before it is a code question.
4. **Every star rating on the site is fabricated.** `prisma.review.create` appears
   nowhere in `src/` — there is still no customer write path, so browse cards and
   map pins show seeded numbers. Publishing invented reviews on a live
   marketplace is a consumer-protection problem, not just a gap.
5. **No notifications of any kind.** No email, no SMS: no booking confirmation, no
   salon alert, no reminder — and **no password reset**, so a customer who
   forgets one is locked out for good.
6. **15 dependency vulnerabilities in production deps: 2 critical, 9 high.**
   `@auth/core`/`next-auth` critical (email normaliser homoglyph bypass — this app
   authenticates by email), `next` high (middleware/proxy bypass; **mitigated
   here** because every layout re-checks the role server-side), `sharp`/libvips
   high (and it processes untrusted uploads). Also `next-auth@5.0.0-beta.31` — a
   beta in production.
7. **The site-review form is unauthenticated and unmoderated**, publishing
   straight to the landing page. Already demonstrated: a review from "maj"
   arrived through it during this session.
8. **No rate limiting anywhere** — login, register, booking and the review form
   are all open — and no email verification at signup.
9. **Saudi regulatory gaps:** no VAT (15%) anywhere in prices or commission, no
   ZATCA e-invoicing, no privacy policy, terms, or refund policy pages, no
   commercial registration displayed. PDPL applies to the names and phone
   numbers already being stored.
10. ⚠️ **The webhook trusts the gateway's amount.** `settleFromGateway` computes
    the commission split from `gateway.amount` and never compares it with the
    invoiced `payment.amount`. A mismatch settles the booking and books a fee on
    a number we did not charge. **Verify the amount before settling.**

**Should fix, not blocking:** images are stored as bytes in Postgres (fine at 9,
a cost problem at scale, and no CDN); no `error.tsx`, `not-found.tsx`, `robots.ts`
or `sitemap.ts`, and only two pages set metadata; effectively no logging — one
`console.error` in 8,300 lines, so a production payment failure would leave no
trace; the 68 tests cover pure logic only (time, availability, money, geo) and
nothing touches auth, settlement or a server action, so the riskiest code has the
least coverage; no cancellation window or fee, so a customer can cancel a minute
before and be refunded in full.

**What is genuinely good, and the reason the rest is fixable:** double-booking is
prevented by a Postgres EXCLUDE constraint rather than application logic; booking
times are re-derived server-side and the posted start only *selects* among freshly
computed slots; authorisation is defence in depth — the proxy is explicitly
optimistic, layouts re-check, actions check again, and ownership is enforced by
scoping the query rather than comparing ids; settlement is idempotent and freezes
the commission at capture, and `authorized` is deliberately not treated as paid;
the hosted-invoice flow keeps card data off the server entirely, so nothing here
is in PCI scope; uploads are re-encoded through sharp with EXIF stripped and SVG
refused; the webhook secret is compared in constant time and an unset secret
rejects everything.

**Nothing was changed** — the request was an assessment.

---

**Asked (2026-09-05):** *"first fix the font in -ly because i still think i
can be better also please the logo to be 3d interactive when the mouse is on it."*

**Answered:** `-ly` is now **Kanit Black Italic**, and the chip is a real 3D object
that tilts toward the cursor with a highlight tracking across its face. Same URL.

**Anton lasted one round, and the fix was an axis, not a face.** Anton contrasted
with the serif only by *width*, and condensed-next-to-normal is a quiet
difference — which is exactly why it read as plain. Slanting the display half
sets it against an upright serif on the axis a reader registers first, so the same
weight now reads as motion rather than as a second, narrower word. Sheet:
`C:\temp\ly-compare2.html` — fifteen faces across four directions (sporty italic,
techno, street, contemporary display) at the two real sizes. **Saira Condensed 900
Italic** was the runner-up, sharper and narrower — more racing-team than salon.
Rubik Mono One and Bungee both render lowercase as capitals, which silently
changes the name to `book-LY`; Orbitron's "ly" reads as "lu" at 16px.

**Italic is loaded, not synthesised** — `style: ["italic"]` in `next/font`, so
`font-style: italic` picks up a drawn italic instead of having the browser shear a
900-weight upright into mud. The span also declares `font-black`: at the
inherited 400 the browser was matching a weight nothing had asked for, and the
fallback stack is what pays for that ambiguity. Now asserted: computed style on
the live site is **Kanit / italic / 900 / 18px**.

**The 3D is a client component that writes four CSS custom properties, and
nothing else.** `LogoLockup` (`src/components/logo-lockup.tsx`) turns pointer
position into `--rx`, `--ry` and a highlight's `--gx`/`--gy`; every transform is
in `globals.css`. **No React state** — a `pointermove` that called `setState`
would re-render the header on every mouse event, and that header reads the
session. This is the technique the hero parallax already uses.

**What makes it read as an object rather than a picture of one:** the shears sit
at `translateZ(14px)` above the chip's face, so tilting parallaxes them against
it, and a specular highlight tracks the pointer at `translateZ(6px)` between the
two. Tilt maxes at 16°, the chip scales 1.08 on hover and 0.94 on press, and the
name takes **0.35 of the chip's rotation** — at full strength the two elements
swing apart and the lockup stops reading as one piece.

**`perspective()` inside the chip's own transform, not a `perspective` property on
the lockup.** The lockup is an inline flex row in a sticky header; giving *that*
a perspective puts every descendant on one vanishing point, and the name swings
with the chip instead of trailing it.

**It degrades in both directions, and both were verified rather than assumed.**
With no JS the properties never change, resolve to their `0` defaults, and the
CSS-only hover — shears closing, gradient sweep — still runs. Under
`prefers-reduced-motion: reduce` the component keeps writing `--rx` (measured at
`9.60deg`) and the stylesheet makes it inert: computed transform `none`, highlight
opacity `0`.

**Verified:** typecheck, lint and 68 tests clean; a full rebuild; and computed
styles read off the live tunnel with the pointer at two opposite corners of the
lockup — `rx/ry` flipping cleanly from `11.20/−12.16deg` to `−11.20/12.16deg`,
the highlight following to the matching corner, the properties **cleared** on
pointer-leave so the chip settles home, and the Arabic wordmark still in
`book|-ly` order. Screenshots at rest, tilted from two corners, and in Arabic.

---

**Asked (2026-09-05):** *"first give -ly different forn that is hype, cool
and bold font then i want you to make the logo and the name to be interactive."*

**Answered:** `-ly` is now **Anton**, and the whole lockup — chip, shears and name
— reacts to hover, keyboard focus and press. Live on the same URL.

**Anton, picked from thirteen faces rendered at the two real logo sizes beside the
serif "book"** (`C:\temp\ly-compare.html`). The reason it wins is that it is
**condensed**: it lands as *tall* rather than *wide*, so it out-shouts the serif
without out-measuring it, and a two-face logo stays one word instead of splitting
into two. Bungee was the loudest but renders lowercase as capitals — `book-LY`,
which quietly changes the name. Outfit 900 and Unbounded 800 were the runners-up
and are the cleaner, less shouty answers if this reads as too much. One weight is
requested, because Anton ships 400 only and is already black — asking for 700
would have the browser smear a synthetic bold over it.

**Kaushan Script is gone from the tree.** It held this slot for ten days.

**The interaction is CSS only — no JS, no state.** That matters here: the header
is server-rendered on every page of the site, and the project's one piece of
client JS is the hero parallax. On hover or focus the two shear halves **rotate
toward each other about the pivot and close**, the chip lifts, tilts 8° into the
cut and gains a brand-coloured glow, the gradient **sweeps left-to-right across
the name**, and the `-ly` kicks up 2px. On press the chip snaps down, so a click
feels like the snip landing.

**Three details that are the actual work:**

- **`transform-box: view-box`, not the default.** The pivot is a coordinate in the
  32×32 drawing (16, 13.6). The default `fill-box` resolves `transform-origin`
  against *each group's own bounding box*, which puts the hinge in a different
  place for each half and makes the shears come apart instead of closing.
- **The halves had to be regrouped before they could move.** The blade ending
  top-right is hinged to the ring on the **left** — that is how real shears work.
  Grouped the obvious way (each blade with the ring beneath it) the animation
  reads as two loose parts sliding past each other.
- **Focus is treated exactly like hover**, not given a lesser state: tabbing to
  the logo snips it and sweeps the gradient, with the focus ring added on top.
  Verified by pressing Tab and reading the computed transform, not by assuming.

**Reduced motion removes it rather than shortening it.** Every state the animation
expresses is already carried by the cursor and the focus ring, so under
`prefers-reduced-motion: reduce` the transforms and the sweep are switched off
entirely. Verified in a Playwright context with `reducedMotion: "reduce"`: all
three read `none` / `0% 50%` while hovering.

**Verified:** typecheck, lint and 68 tests clean; a full rebuild; and computed
styles read off the live tunnel in four states — at rest (Anton loaded, 18px
against the serif's 20px), hovered (shears ±11°, chip 1.07 and −8°, sweep at
100%, tail −2px), keyboard-focused (Tab lands on the lockup, same rotation, brand
outline), and reduced-motion (nothing moves). Screenshots of all four plus the
Arabic header, where the wordmark still reads `book|-ly` in order.

---

**Asked (2026-09-05):** *"can you design a logo that fit the use of this
website."*

**Answered:** The logo is now a pair of **open shears knocked out of the brand
chip**, beside the two-face wordmark, live on the same URL. The plain gradient
square that stood there since the redesign is gone. `BrandMark` in
`src/components/brand-mark.tsx`; the same drawing is the site icon at
`src/app/icon.svg`, with a standalone copy in `public/brand/mark.svg`.

**Three rounds were drawn and screenshotted before anything was wired in.**
Sheets: `C:\temp\logo-compare.html`, `-2`, `-3` — twelve marks, each rendered at
64/32/24px, knocked out of the chip, and in a header lockup beside the wordmark,
on the real canvas and on a light surface.

**The rule that decided it: the name already says booking, so the mark should say
the trade.** A calendar mark (drawn, rejected) repeats what "book-ly" has already
said and leaves the salon unstated. A bookmark (drawn twice, rejected) reads as a
*save* icon and says nothing about hair. The shears say the half the name cannot,
so the lockup carries the whole proposition — book, and cut.

**The second rule was 24px, and it eliminated more than taste did.** The header
renders the mark at 24. At that size a calendar's slot dots close into a smudge,
the bookmark's notch disappears, and a "shear clock" that worked on paper turned
out to read as **a face** — the two ring handles become two eyes. Two blades and
two rings survive. So does the chip: knocking the mark out of the gradient keeps
the block of colour the header layout was built around and spends it on meaning
instead of decoration. The knockout is the *page background* colour, so the mark
is a hole in the chip rather than ink on it — which is what keeps it legible when
the chip sits on a light surface.

⚠️ **a drawing bug worth keeping, because it silently deletes artwork:** an
SVG gradient with the default `gradientUnits="objectBoundingBox"` **does not paint
on a straight horizontal or vertical stroke**. That bounding box has zero area in
one axis, so the gradient has nowhere to interpolate and the stroke renders as
nothing at all. Round 1 lost a comb's teeth and a horizon line to this, and I read
it as weak design rather than a broken render. Everything since uses
`gradientUnits="userSpaceOnUse"`. **If part of an SVG vanishes and the rest is
fine, check the axis before redrawing it.**

The default Next.js `favicon.ico` was deleted so `icon.svg` is what browsers pick
up; it is committed at `4bed42f`, so `git checkout -- src/app/favicon.ico`
restores it.

**Verified:** typecheck, lint and 68 tests clean; a full rebuild with `/icon.svg`
in the route list, served 200 through the tunnel as
`rel="icon" type="image/svg+xml"`; and screenshots of the English header, the
Arabic header, the landing page and the hero app bar, which now carries the full
lockup.

---

**Asked (2026-09-05):** *"i want the book to be in a different font the minion pro
font."*

**Answered:** The wordmark is now **two faces**: `book` in a Minion-class oldstyle
serif, `-ly` still in the Kaushan Script brush. Read as the *"book" half*, not the
whole word — the brush is what made the logo a logo, and nothing said to drop it.

⚠️ **Minion Pro cannot be served, and that is a licence fact, not a
technical one.** It is an Adobe retail family: not on Google Fonts, and its EULA
does not cover self-hosting it as a webfont. Serving the genuine face needs an
**Adobe Fonts web project on the owner's Creative Cloud account**, publishing a
kit from `use.typekit.net`. It is also **not installed on this machine**, so it
could not even be rendered locally for comparison.

**So the stack asks for it first and falls back honestly:**
`"Minion Pro", Crimson Pro, Georgia, "Times New Roman", serif`. Anyone with Minion
Pro installed sees the real face. Everyone else gets **Crimson Pro**, drawn from
the same oldstyle model Minion is and the closest face on Google Fonts. **Chosen
by looking:** nine serifs rendered as "book" at the two real logo sizes against
the brush "-ly", on the real background — sheet at `C:\temp\minion-compare.html`.
Cormorant Garamond went too light to survive 16px; Gelasio and Georgia read too
wide beside a script; Sorts Mill Goudy and Lora are too mannered. Source Serif 4
was the runner-up and is the other defensible answer, being Slimbach's own open
serif.

**Semibold, not regular.** At 400 the serif reads lighter than the brush beside it
and the wordmark looks like two unrelated words that happen to touch; 600 matches
the brush's stroke weight. Only 600 is requested, because only 600 is used.

**The script half is set one step down** — `text-lg` against `text-xl` in the
header, `text-sm` against `text-base` in the app bar. A script has a smaller
apparent size than a serif at the same px, so matching the numbers would have made
the brush half look bigger, not equal.

⚠️ **a real bug, caught by a screenshot and by no assertion:** splitting the
wordmark into two spans made it a flex row, and on the Arabic pages a flex row
inherits `direction: rtl` — so the logo rendered **"ly-book"**. Every HTTP check
still passed, because the DOM order was right and only the paint was wrong. Fixed
with `dir="ltr"` on the wrapper, which is also the honest description of a Latin
brand. **A two-element logo on a bilingual site needs its direction pinned; one
text node never had to say so.**

---

**Asked (2026-09-05):** *"the name of the website change it to book-ly."*

**Answered:** The site is **book-ly** in both locales, live on the same URL —
**`https://pgp-jackets-contents-behavioral.trycloudflare.com`**. It replaces
"Fade", which lasted eleven days.

**Set exactly as you typed it: lowercase, hyphenated — `book-ly`.** Not
"Book-ly", not "Bookly". If you want it capitalised or the hyphen dropped, that is
one string in two catalogs; say so and it changes.

**The rename is scoped the same way the Fade rename was — to what a user sees.**
Nine files: both message catalogs (`title`, `brand`, the commission hint, the
testimonials subtitle, the support-reply sender), the `<title>` metadata, the
Moyasar invoice description (`book-ly — {salon}`, which is what shows on a card
statement), the seed's admin display name, the README heading, and three code
comments that named the old brand. **Still carrying the original name on purpose:**
the GitHub repo and the npm package (both **renamed to `book-ly` on
2026-09-08**), the folder, the
Postgres database and role, and the seeded `@salonhub.sa` logins — renaming those
means a re-seed, which destroys the payment data every revenue figure rests on.
The live admin's *display name* was updated in the database to "book-ly Admin",
the same hand-edit that was made for Fade, because the seed's `upsert` carries
`update: {}` and will not touch an existing row.

**The brush wordmark survives the rename, and the screenshot is why that is worth
saying.** The concern with `book-ly` in Kaushan Script was the **hyphen** — a
script face draws it as a short brush stroke, and there was no reason to assume it
would sit correctly between two lowercase letters. It does: the wordmark reads
cleanly at both sizes, 20px in the header and 16px in the hero bar, on one line at
393px. The comment about tracking was updated with it — the collision
`tracking-tight` would now cause is **"l" into "y"**, not "d" into "e".

**In Arabic the hyphen was the second thing to check, and it also holds.** In
`اطّلع على آراء الناس حول book-ly — وأضِف رأيك.` the Latin run stays intact and
left-to-right inside the RTL paragraph; the hyphen is a neutral character between
two Latin letters, so bidi keeps it inside the run rather than flipping it out.
Screenshot-verified, not reasoned about.

**Verified: typecheck, lint and 68 tests clean; a full production rebuild in
`C:\temp\salon-hub-live` with all 23 routes present; then 12 checks against the
tunnel** — `<title>` is book-ly in both locales, **zero** "Fade" anywhere in the
rendered HTML of either, 12 brand occurrences each, `dir="rtl"` with no
`MISSING_MESSAGE`, the wordmark computing to Kaushan Script at weight 400 with
normal tracking on `/en`, `/ar` and `/en/salons`, and four screenshots (English
landing, Arabic landing, Arabic testimonials, mobile header at 393px).

**The tunnel hostname survived** because `cloudflared` kept running while only the
`:3111` server was restarted for the rebuild — the URL handed over earlier this
session is still the live one.

⚠️ **Noticed, not mine to fix:** a site review from **"maj"** dated 2026-09-05 —
*"i think this can be better"* — is now on the landing page beside the seeded
"Sara A." one. It arrived through the public form during this session. The
pre-existing bidi defect on English review text in the Arabic block (`.Sara A`,
`!minute. Beautiful and fast`) is unchanged; the fix is `dir="auto"` on review
text and it is still not in scope.

---

**Asked (2026-09-05):** *"review the progress report and pull up the url
for update."*

**Answered:** Reviewed (led with the 2026-08-26 documentation pass below) and
brought the site back up at
**`https://pgp-jackets-contents-behavioral.trycloudflare.com`**.

**A restart, not a rebuild — but this time HEAD could not settle that, and file
hashes had to.** After 10 days idle everything was down: no `node`, no
`cloudflared`, the Docker daemon itself off, and the 2026-08-26 hostname no longer
resolving. `HEAD` is still `4bed42f` with the same 12 modified files — and that is
exactly the problem with the rule as it was written. **The running build is made
from *uncommitted* work, so `git diff <last-built-commit> HEAD` compares two
commits that both predate everything the site actually shows.** It would have said
"no app code moved" no matter what had been edited. The eight modified app files
were `md5sum`-compared against `C:\temp\salon-hub-live` instead — all identical —
which is what actually proved the 2026-08-26 build still matches the tree. Chain:
Docker Desktop → `docker compose up -d` → `next start -p 3111` → fresh quick
tunnel. **No `npm install`, no build.** Server ready in 2.5 s.

**The seeded data survived the 10 days intact** — confirmed in Postgres before
opening anything: **42 succeeded payments, gross SAR 6,740.00, platform fee
1,549.00, salon payouts 5,191.00**, plus 3 refunds, 3 salons, 9 reviews and 2
support tickets. Every figure matches what has been recorded since 2026-08-08.

**Verified with 13 HTTP checks against the tunnel hostname**, all passing: `/en`,
`/ar`, `/en/salons`, `/ar/salons`, `/en/auth/login`, `/en/admin/revenue` and a
salon detail page all answer 200; `<title>` is **Fade** in both locales; **zero**
occurrences of "Salon Hub"/"salonhub" in the rendered English HTML; `dir="rtl"` on
the Arabic page with **no `MISSING_MESSAGE`**; the `font-wordmark` utility appears
three times and the served markup carries a **`kaushan_script_…` module** — the
brush wordmark is genuinely loaded, not falling back; star ratings render on
browse.

⚠️ **These were `curl`/HTML assertions, not browser checks.** No Playwright run
this session, so nothing here is screenshot-verified — the "when a check disagrees
with a screenshot, suspect the check" lesson was not exercised. What is proven is
that the pages serve, the brand is right, and the data is intact.

**Two Postgres query traps cost a query each and are now in "Environment notes":**
the role is **`salonhub`**, not `postgres`, and the `PaymentStatus` enum has **no
`SETTLED`** value — settled money is `SUCCEEDED`, on columns `platformFee` and
`salonNet`, not `platformFeeAmount`/`salonPayoutAmount`.

**Nothing was changed and nothing was committed** — the request was to review and
produce a URL. The 12 files are still uncommitted on top of `4bed42f`, so item 0
below is unchanged and now 10 days old.

---

**Asked (2026-08-26):** *"update the progress report with the latest
updates."*

**Answered:** The per-request entries were **already current** — each one has been
written as its work finished, through to the brush wordmark below. So rather than
report "nothing to do", the check went looking for what actually *was* stale, and
found it in the parts that describe the project's state rather than its history:

- **"Picking up" was still anchored at 2026-08-04** and claimed a clean working
  tree at `05ed9f1`. Both false. It now records the real position: `master` and
  `origin/main` both still at **`4bed42f`**, with **12 uncommitted files
  (+467/−40)** carrying the rename, the wordmark and this doc trail — and a
  warning that a stray `git checkout` there destroys two days of work.
- **The published repo is two days behind what is running**, which nothing said.
  A fresh clone still says Salon Hub and does not reproduce the live site. Now
  stated plainly, and promoted to item 0 of the suggested order.
- **The database inventory was out of date** — it listed the 2026-08-04 contents
  and missed the 42 settled payments, 9 images and 2 support tickets since. Also
  now records that the seeded logins remain `@salonhub.sa` on purpose, because
  renaming them means a re-seed that destroys the revenue data.
- **Two caveats had quietly expired.** The 2026-07-27 entry still said the hero
  was "never screenshot-verified" and the only JS surface; both stopped being true
  at M7 and again on 2026-08-25. Corrected in place rather than deleted, so the
  original claim and its expiry both stay visible.
- **M12 added** to the milestone table for the brand work, and the two "last live"
  tunnel dates refreshed.

**Nothing about the product changed** — this was a documentation pass, and no code
was touched.

---

**Asked (2026-08-26):** *"the font for the log "fade" need to be brush
type."*

**Answered:** The wordmark is now **Kaushan Script**, a brush face, live on the
same URL. It replaces the Sora set an hour earlier.

**Chosen by looking, not guessing.** Eight Google brush/script faces were
rendered as "Fade" at the two sizes the logo actually uses (18px header, 14px app
bar) plus large, on the real dark background with the brand gradient, and
screenshotted: Caveat Brush, Kaushan Script, Yellowtail, Pacifico, Satisfy,
Permanent Marker, Courgette, Damion. **Small sizes did the eliminating** —
Satisfy's *F* reads as a **7**, Yellowtail and Damion go mushy at 14px, and
Permanent Marker reads graffiti rather than salon. Kaushan Script keeps genuine
brush character (thin-to-thick stroke contrast, angled entry) while staying
legible at 14px. Sheet: `C:\temp\brush-compare.html`.

**A brush face forced three changes to the logo's classes, and they are the
substance of this entry:**

- **`font-extrabold` had to go.** Kaushan Script ships weight 400 only. Asking
  for bold makes the browser synthesise one by smearing the outline, which
  destroys the stroke contrast that makes it a brush face at all. Now asserted:
  the logo computes to `font-weight: 400`.
- **`tracking-tight` had to go.** The letterforms already flow into each other;
  tightening collides the *d* into the *e*. Also asserted.
- **A size bump**, `text-lg`→`text-xl` in the header and `text-sm`→`text-base` in
  the app bar. A script has a smaller apparent size than a sans at the same px,
  so the logo needed a step up to hold its previous optical weight.

**The fallback changed too.** It is now `cursive` before Geist: if the face fails
to load, a system script still reads as a logo, where a sans at weight 400 would
just look like unstyled text.

**Verified with 13 browser checks, all passing** — the previous 11 plus the two
new assertions on weight and tracking. Both wordmarks resolve to Kaushan Script,
body copy and the hero headline are untouched on Geist, the face is genuinely
loaded, nothing is fetched from an external font host, and the Arabic header
carries the Latin wordmark in brush while Arabic nav text stays on Noto. The
other 26 site checks pass. Typecheck, lint and 68 tests clean.

---

**Asked (2026-08-26):** *"soge font to be applied on the log name"* —
read as the **logo wordmark**, and confirmed in follow-up as **Sora** (the name
was ambiguous between Sora and Segoe UI; Segoe would have been the wrong answer
anyway, since Microsoft does not license it for web serving and it would have
rendered for Windows visitors only — most Saudi traffic is mobile).

**Answered:** The wordmark was set in **Sora ExtraBold**. ⚠️ **Superseded the
same day** by the brush-script request above — Sora is no longer in the tree. The
mechanism below (the `--font-wordmark` token, the `font-wordmark` utility, the
two elements it is applied to) is still exactly how the logo font works; only the
face and its weight/tracking changed.

**It is the logo and nothing else.** Sora is loaded through `next/font/google`
beside Geist, exposed as a `--font-wordmark` token, and applied via the generated
`font-wordmark` utility to the two places the brand renders — `site-header.tsx`
and the hero's floating app bar in `interactive-hero.tsx`. Body copy, headlines
and nav are untouched on Geist, which is asserted rather than assumed.

**One weight, Latin only.** The wordmark is `font-extrabold` in both places, so
only 800 is requested — the first cut shipped 700 as well and nothing ever used
it. Latin-only because the brand reads "Fade" in Arabic too, so Sora is never
asked for a glyph it lacks. The fallback chain is Sora → **Geist**, not a generic
sans: if the face fails, the logo should look like the rest of the site rather
than like a different site.

**Self-hosted, like every other font here** — `next/font` emits the woff2 under
`/_next/static/media/`. Verified **zero requests to any external font host**;
nothing reaches `fonts.googleapis.com` or `fonts.gstatic.com`.

**Verified with 11 browser checks, all passing:** the computed family on both
wordmarks, the text still reading "Fade", body copy and the hero headline
*not* switching, the face genuinely loaded, no external font requests, and the
Arabic header carrying the Latin wordmark in Sora while Arabic nav text stays on
Noto. The other 26 site checks still pass. Typecheck, lint and 68 tests clean.

**A verification lesson worth keeping: `document.fonts.check()` needs the weight
that is actually used.** The check reported Sora "not loaded" while the logo was
rendering in it perfectly — it asked for weight 700, which the browser had never
fetched because nothing on the page uses it. Browsers load faces lazily, so an
unused weight always reports `unloaded`. Ask for the weight under test, and back
it with a **width measurement against the fallback** — Sora renders "Fade" at
118.77px where Geist gives 116.95px, which is what proves the face is really
applied rather than silently falling through.

---

**Asked (2026-08-25):** *"go back to Leaflet please until i figure stuff
out."*

**Answered:** Reverted. The site is back on **Leaflet + OpenStreetMap**, live on
the same URL, and the HudHud work was **discarded at the owner's request** rather
than parked on a branch — that choice was put to them explicitly, because none of
it was committed and reverting in place destroyed it.

**What went back:** `leaflet.ts` restored, both map components restored from
`HEAD`, `leaflet`/`@types/leaflet` reinstalled, `maplibre-gl` and
`@mapbox/mapbox-gl-rtl-text` uninstalled, `.gitignore`, `eslint.config.mjs` and
`.env.example` reverted. **Deleted:** `provider.ts`, `/api/geo/search`,
`scripts/copy-rtl-plugin.mjs`, `public/maplibre/`. The `prebuild` step is gone.

**The Fade rename was preserved throughout, which is the whole reason this was
not a blanket `git checkout`.** Two files carried both changes —
`src/app/globals.css` (brand comment + the maps block) and `README.md` — so those
were reverted by hand, section by section. Everything else was safe to take from
`HEAD` because the rename never touched it.

**Verified with 14 checks against the live tunnel, all passing:** Leaflet mounted,
**MapLibre absent from the DOM**, OSM tiles loading (12/12), the dark filter back
on `.leaflet-tile-pane`, three badged pins, attribution reading "Leaflet |
© OpenStreetMap contributors" again, popups, Arabic RTL, the picker prefilling,
clicking the map rewriting the lat input, and **geocoding calling Nominatim
directly from the browser again** now that the proxy is gone. Confirmed the
removed surfaces really are removed: `/api/geo/search` and
`/maplibre/mapbox-gl-rtl-text.js` both 404. The other 26 site checks still pass,
so the rename and revenue pages are untouched. Typecheck, lint and 68 tests clean;
29 route lines, matching the pre-HudHud build exactly.

**The build copy needed its removed files cleared first.** `tar` overwrites and
adds but never deletes, so a plain re-sync would have left `provider.ts` and the
geo route alive in `C:\temp\salon-hub-live` and rebuilt them into the bundle.
`src/components/map`, `src/app/api/geo`, `public/maplibre` and `scripts` were
removed there before syncing. **Worth remembering for every future revert.**

---

### Reverted 2026-08-25 — HudHud Maps (built, then discarded the same day)

**Asked:** *"please use hudhud maps in website."* — superseded within the hour by
the revert above. Kept here because the research is the expensive part and it
would otherwise have to be redone from scratch.

**What it involved.** HudHud's product is MapLibre-compliant **vector** styles, so
Leaflet — raster-only — could not render it; the migration to MapLibre GL JS was
forced, not stylistic. `provider.ts` returned either HudHud's style URL or an
inline MapLibre style wrapping OSM raster tiles, so one library served both
providers.

**The API, as documented at `docs.hudhud.sa`:**

- Style: `https://b.hudhud.sa/v1/maps/styles/{map_id}?variant={light|dark}&lang={ar|en}&api_key={pk_…}`
- Geocoding: `POST https://b.hudhud.sa/v1/geocoding/search`, body `{query}`,
  `Authorization: Bearer <secret>`, response wrapped in `{ok, error, data.results}`
  with `lat`/`lon` — **a 200 with `ok:false` is a failure**, so the envelope has
  to be checked, not the status.
- **Three values, all required, none guessable:** publishable key (`pk_`,
  browser-safe, query param), secret key (backend Bearer), and a **map id created
  per account in their console**. Self-serve signup at
  `https://console.developers.hudhud.sa/accounts/signup`.

**Why it was worth doing, and would be again:** a real dark style (`variant=dark`)
instead of the CSS invert that dresses up OSM's light tiles; **native Arabic
labels** (`lang=ar`), which is the standing cost this project accepted on
2026-08-04 for a bilingual Saudi product; and geocoding against the Saudi National
Address system instead of Nominatim.

**Two constraints any redo will hit again.** The secret key forces geocoding
server-side, so a `/api/geo/search` route is unavoidable — and it should require a
session, because it fronts a metered API. And MapLibre's **RTL text plugin** is
loaded by URL into a web worker, so it cannot be imported; HudHud's own example
points at unpkg, which would be this site's first runtime CDN dependency. Copying
it out of `node_modules` at `prebuild` avoided that, and the package's `exports`
map blocks the `dist/` subpath, so the script had to resolve the package root and
walk to it.

⚠️ **It was never exercised against HudHud.** All 17 checks that passed at the
time drove the OpenStreetMap fallback. Every HudHud-specific path was written from
the docs and never executed.

---

**Asked (2026-08-25):** *"i need the new name for this project to be Fade."*
— clarified in follow-up: the brand should read **Fade in English on the Arabic
pages too**, not a transliteration.

**Answered:** Renamed everywhere a user can see it, in both locales, and
redeployed to the same URL: **`https://answer-extended-per-inc.trycloudflare.com`**.

**Ten catalog strings, not one.** The brand was not a single constant — it sat in
five keys per locale (`Landing.title`, `Nav.brand`, `Owner.revFeesHint`,
`SiteReviews.subtitle`, `Support.replyFrom`), and the Arabic ones held the
transliteration **صالون هَب**, so they would not have inherited an English-side
change. All ten now read `Fade`. Both catalogs still carry **347 keys and identical
key sets**.

Also renamed: the `<title>` metadata, the **Moyasar invoice description** — which
is what a customer will see on their card statement, so it matters more than its
one line suggests — the seeded admin's display name (in `prisma/seed.ts` *and* in
the live row, since the seed only affects future seeds), the README, and the
comments in `globals.css`, `schema.prisma`, `site-header.tsx` and
`site-reviews.tsx` that named the old brand.

⚠️ **Deliberately not renamed, and each would cost something:** the GitHub repo
(`alqaabdq-crypto/salon-hub` — outward-facing, and the old name stays in history
regardless), the npm package name, the local folder, the Postgres database and
role, and the seeded `@salonhub.sa` demo accounts. **Renaming the database or the
demo emails means re-seeding, which destroys the 42 settled payments and every
figure on `/admin/revenue`.** The project owner chose the visible-rename scope; all
of these remain open and cheap except the database.

**A rebuild was genuinely required this time** — unlike the restart earlier the
same day, app code moved. Re-synced with `tar -C <abs path>` per the standing rule,
`rm -rf .next`, clean build, 29 route lines, **0 `*DESKTOP*` conflict files**. The
server was restarted on the same port, so **the tunnel hostname survived** —
`cloudflared` points at `localhost:3111` and never knew.

**Verified with 26 browser checks, all passing** — the 21 from earlier today plus
five for the rename: the served HTML of `/en` and `/ar` contains `Fade` and neither
`Salon Hub` nor `صالون هَب` (next-intl serialises the whole catalog into the page,
so this covers every string, not just the rendered ones), the document title, the
header wordmark, and the Latin brand appearing inline on Arabic pages.

**Screenshot-checked in Arabic, which is where this could have gone wrong.** Latin
inside RTL is a bidi question, and it resolves correctly: the wordmark sits at the
RTL start of the header, and `اطّلع على آراء الناس حول Fade — وأضِف رأيك.` reads
right-to-left with `Fade` embedded cleanly. No CSS or `dir` handling was needed.

⚠️ **Noticed, pre-existing, not fixed:** the seeded English test review ("Sara A.",
from 2026-07-27) renders in the Arabic testimonials block with its punctuation
visually displaced — `.Sara A`, `!minute. Beautiful and fast`. That is the bidi
algorithm applying RTL paragraph direction to English content, and it predates the
rename. Real user reviews in English would hit the same thing; the fix is `dir="auto"`
on review text, which was not in scope here.

---

**Asked (2026-08-25):** *"please bring up the last in the review report"* —
clarified in follow-up to **relaunch the site and produce a URL**, not merely read
the report back.

**Answered:** Led with the entry below, then brought the site back up at
**`https://answer-extended-per-inc.trycloudflare.com`**.

**This was a restart, not a rebuild, and the rule in "Picking up" is what settled
it.** After 15 days idle everything was down — no `node`, no `cloudflared`, no
Docker daemon, and the 2026-08-10 hostname no longer resolved. But `HEAD` is still
`4bed42f`, the exact commit built on 2026-08-10, with only `PROGRESS.md` dirty
(docs). The `.next` build in `C:\temp\salon-hub-live` and its `node_modules` were
intact, so the chain was Docker Desktop → `docker compose up -d` → `next start
-p 3111` → fresh quick tunnel. **No `npm install`, no build.** Server answered 200
in 4 seconds.

**The seeded data survived 15 days and reads exactly as recorded on 2026-08-08** —
confirmed in Postgres before touching the browser: 42 settled payments, platform
fee SAR 1,549.00, gross 6,740.00, 3 `Subscription` rows.

**Verified with 21 browser checks against the tunnel hostname**, all passing:
landing, browse with star ratings, salon detail, Arabic RTL on two pages with no
missing messages, signed-out `/admin/revenue` → login, admin login landing on
`/admin`, the dashboard link, every figure on the revenue page, Arabic revenue
page, owner login landing on `/owner`, and **a signed-in salon owner being bounced
off `/admin/revenue`** — the authorization check that matters, and the one the
previous run only appeared to make (see below). All three commission routes still
read side by side: Rose **30%**, Glow **20%**, Al Fursan **10%**, blended **23%**,
and the table reconciles to the tiles.

**Screenshot-checked, and the stale-months defect is still fixed 15 days on.** The
chart reads Mar–**Aug** with the current month populated at **294**. The seeder's
`now()` rebase of 2026-08-08 is holding.

**Two lessons from the verification itself, both mine, not the app's:**

- **Filling a hydrated client form before hydration posts empty credentials.** The
  admin login "failed" with *Invalid email or password* and the server logged
  `CredentialsSignin`. The password was right — bcrypt-compared against the stored
  hash directly to prove it, and a raw `curl` to `/api/auth/callback/credentials`
  returned a valid session token. `page.fill()` had run before React attached its
  `onChange`, so `signIn` sent `""`. **Wait for `networkidle`, then `type()` with a
  delay** on `/auth/login` — its inputs carry `id` only, no `name`.
- **A "passes" that never signed in is not a pass.** With login broken, three
  checks — no MISSING_MESSAGE, Arabic RTL, owner refused `/admin/revenue` — went
  green while looking at a login page. The owner check now asserts the login landed
  on `/owner` first. **Assert the precondition, or an auth check proves nothing.**

**Nothing was changed** — the request was to bring it up, and no amendment
followed. The open gaps are unchanged: no customer review-writing, no real
deployment, no Moyasar call.

⚠️ **Still flagged, still not fixed: `C:\temp\salon-hub-live` holds ~460 MB of the
2026-08-07 tar accident** — `OneDrive/`, `Saved Games/`, `Recent/` and friends
beside `src/`. Inert and ignored by the build, but the build copy is not a clean
tree.

---

**Asked (2026-08-10):** *"please review the progress report and produce one
url for me to review."*

**Answered:** Reviewed (led with the commission entry below) and brought the site
back up at **`https://betty-comprehensive-kijiji-situated.trycloudflare.com`**.

Unlike 2026-08-07, **everything really was down** this time — the Docker daemon
itself, the `:3111` server and `cloudflared` — after two days idle, so the whole
chain was rebuilt: Docker Desktop → Postgres container → source re-synced to
`C:\temp\salon-hub-live` → clean production build → `next start -p 3111` → a fresh
quick tunnel. **A rebuild was genuinely required this time**: the two commits since
the last build (`fef9fa5` admin revenue, `4bed42f` the 30% commission) are app code,
not docs. Build clean; all 23 routes present including `/admin/revenue`.

**Verified with 18 browser checks against the tunnel hostname**, not the process
list: landing, browse with star ratings, Arabic RTL on two pages with no missing
messages, signed-out `/admin/revenue` → login, admin login, the dashboard link, and
the revenue page itself. **The seeded data survived the restart and reads exactly
as recorded on 2026-08-08** — platform earnings SAR 1,549.00, gross 6,740.00, paid
to salons 5,191.00, 42 settled, blended 23%, and all three commission routes
visible side by side: Rose **30%** (free plan → platform default), Glow **20%**
(negotiated override), Al Fursan **10%** (premium plan).

**Screenshot-checked, and the stale-months defect stays fixed.** The six-month
chart reads Mar–**Aug** with the current month populated (294), two days after the
seeder was rebased on `now()` — the trailing-zero bug of 2026-08-04 has not
returned.

**Nothing was changed** — the request was to review and produce a URL, and no
amendment followed. The open gaps are unchanged: no customer review-writing, no
real deployment, no Moyasar call.

⚠️ **Left in place, flagged not fixed: `C:\temp\salon-hub-live` still holds
~460 MB of the 2026-08-07 tar accident** — `OneDrive/`, `Saved Games/`, `Recent/`
and friends, sitting beside `src/`. The robocopy purge recorded in that entry did
not take them all. They are copies, they are inert, and the build ignores them, but
the build copy is not the clean tree that entry implies.

---

**Asked (2026-08-08):** *"make the commission in the free plan 30%."*

**Answered:** `DEFAULT_PLATFORM_COMMISSION` is now **0.30**, up from 0.15.

That constant *is* the free-tier rate: the `FREE` plan carries a null
`commissionRate` and inherits it, as does a salon with no subscription at all.
Changing it in one place was therefore the whole change — no migration, and the
precedence chain (**salon override → plan rate → platform default**) is untouched.
Premium still buys **10%**, so the gap that justifies the SAR 199/month
subscription widened from 5 points to **20**.

**The demo seeder was reworked to stop contradicting it.** It had hardcoded
15%/12%/15% per salon, which would have silently disagreed with the new default.
It now puts each salon on a real tier and resolves the rate through the same
`resolveCommissionRate` the payment path uses, so all three routes are exercised
rather than merely unit-tested:

| Salon | Route | Rate |
| --- | --- | --- |
| Rose Beauty Lounge | `FREE` plan → platform default | **30%** |
| Glow Studio | negotiated salon override | **20%** |
| Al Fursan Barbers | `PREMIUM` plan rate | **10%** |

**The `Subscription` table now has rows for the first time** — previously empty,
which is why the plan-rate branch had never run against real data. Platform
commission on the same 42 bookings rose from SAR 973.50 to **SAR 1,549**, and the
blended rate from 14.4% to **23%**.

⚠️ **Existing payments were regenerated, not repriced.** The seeder clears and
rewrites its rows, so these figures reflect the new rate. In production the
opposite holds and is the point of the design: a split is frozen at capture time,
so changing this constant never rewrites what a salon has already earned. Only
future payments would see 30%.

68 tests still pass — they assert against the constant rather than a literal — and
the 14 admin-revenue browser checks pass with the new figures.

---

**Asked (2026-08-08):** *"i need the admin dashboard to have the revenue and
how much each salon earn."*

**Answered:** New **`/admin/revenue`**, linked from the admin dashboard beside the
support queue, with the platform's own commission on the dashboard tile itself.

- **Four tiles:** platform earnings (Σ `platformFee` — the marketplace's actual
  revenue), gross processed, paid to salons, and settled payment count.
- **Earnings by salon:** a table of paid bookings, gross, commission, **what the
  salon earns**, and the **realised** commission rate — `fee ÷ gross`, not the
  configured rate, so a salon whose rate changed mid-period reads between the two.
  Ordered by salon earnings, with a totals row that reconciles.
- **Monthly platform earnings** reusing the existing `RevenueChart` rather than
  building a second chart.
- Money summed with `Prisma.Decimal` throughout. The dashboard tile uses a SQL
  `aggregate` since it needs one number; the table aggregates in JS because the
  grouping key (`salonId`) lives on the related `Booking`, which Prisma cannot
  `groupBy` directly — hence the explicit `take: 5000` rather than an unbounded read.

**The demo seeder was rewritten**, which fixes a defect recorded on 2026-08-04:
it used fixed `daysAgo` offsets, so **the current month was always empty** and the
six-month chart grew a trailing zero bar as time passed. Months are now derived
from today, and bookings never land in the future. It also seeds **all three
salons** instead of one, at deliberately different volumes and commission rates
(15% / 15% / **12%** negotiated override) — with a single rate the page cannot
show whether it reports the realised rate or just repeats the default.

The resulting data makes the point the page exists to make: **Al Fursan has the
most paid bookings (19) and earns the least (SAR 1,100)**, because its services are
cheap and its rate is lower.

**Verified with 14 browser checks:** the dashboard link and its figure, one row per
earning salon, ordering by earnings, rates genuinely differing per salon, a totals
row, the chart including the current month, Arabic RTL with no missing messages,
and **a salon owner being refused** at `/admin/revenue`. Totals reconcile against
Postgres — 42 paid, SAR 973.50 commission, 14.4% blended. Typecheck, lint and 68
tests clean.

⚠️ **These are seeded payments, not real ones.** Moyasar has still never been
called; every figure here comes from rows the demo seeder wrote.

---

**Asked (2026-08-07):** *"please update the progress report also github."*

**Answered:** `PROGRESS.md` was **already current and already pushed** — `HEAD` and
`origin/main` were both at `a4a95f8` before this request, carrying the support
feature. Rather than report "nothing to do", the check found what actually *was*
stale on GitHub: **the README**.

It still described payments as "planned" (they shipped in M5), stopped before
maps, photos and support existed, and — the long-running item — **published the
admin password in a public repository**. Now fixed:

- **Password leak closed.** Open since the repo went public on 2026-07-27. The
  README no longer prints `admin1234` / `owner1234`; it directs you to set
  `SEED_ADMIN_PASSWORD` / `SEED_OWNER_PASSWORD` and notes the localhost defaults
  live in `prisma/seed.ts`. Worth stating plainly: **those passwords were public
  for eleven days and are in the git history**, so treat them as burned.
- New sections for **Location and discovery**, **Photos** and **Customer service**,
  each carrying the constraint that bites rather than just the feature list — the
  OSM attribution licence condition, Nominatim's rate limit, EXIF/GPS stripping,
  the object-storage migration this will need, and the absence of real rate
  limiting on `/help`.
- Routing table, project layout, testing section and demo-seeder commands brought
  up to date. Testing now says outright that **only the pure modules are in CI**.

---

**Asked (2026-08-07):** *"build me a customer services option."* — scoped in
follow-up to **support against the platform** (not salon messaging), with the loop
closed: **submit → admin replies → customer reads the reply**.

**Answered:** New `SupportTicket` model, a public `/help` page, and an admin queue
at `/admin/support`. Migration `20260807200000_support_tickets`.

- **Guests can raise a ticket.** `customerId` is nullable on purpose — the person
  most in need of support is often the one who cannot sign in — so `name` and
  `email` are always captured rather than read off the account. The admin queue
  flags account-less tickets, since "I cannot sign in" is exactly the case.
- **Signed-in customers see the loop close.** Their tickets, statuses and the
  admin's reply all appear on `/help` under their own history. A signed-out sender
  is told plainly that they will not see the reply there.
- **A ticket can carry a booking**, but only one the sender actually owns —
  otherwise the field is a way to probe whether an arbitrary booking id exists.
- **Answering and closing are separate acts.** Replying sets `ANSWERED`; the admin
  ticks a box to also mark `RESOLVED`, because most replies invite a follow-up.
  Status can be moved without a reply, for things handled by phone.
- **Spam mitigations that survive JS being off** — the concern raised when
  `SiteReview` shipped with open submission and nothing else. A honeypot field
  (accepted with a normal success redirect, so a bot learns nothing), length
  limits, and a cap of 5 open tickets per email address. **None of this stops a
  determined attacker**; real rate limiting or a captcha would.
- Whole thing is no-JS: plain Server Action forms, plain link filters on the queue.

**Verified with 19 browser checks** covering the entire loop end to end — guest
submits, customer submits, admin replies, customer reads it back — plus the
**authorization boundary** (signed out → login, salon owner → home) and Arabic RTL
with no missing messages. Confirmed against Postgres that the **honeypot submission
was silently discarded** rather than merely appearing to succeed, which the browser
alone could not tell. Typecheck, lint and 68 tests clean.

⚠️ **Notifications still do not exist**, and this feature wants them more than
anything built so far: a customer only discovers a reply by returning to `/help`,
and an admin only discovers a ticket by opening the queue. See "What is genuinely
not done".

**Mistake worth recording — I destroyed the build directory.** A `tar` in a command
whose shell had reset its working directory to `C:\Users\Admin` archived the **home
directory** into `C:\temp\salon-hub-live`. No source was touched (tar only read),
and the target is a disposable build copy, but it had to be purged with robocopy
and rebuilt from scratch. **Every sync command now uses `tar -C <project> …`** so a
reset cwd cannot redirect it. Full note under "Environment notes".

---

**Asked (2026-08-07):** *"now add the salon cover photo as well."*

**Answered:** Done, on the machinery built an hour earlier. Owners upload a cover
on `/owner/profile`; it renders as a full-bleed hero on the salon page **and on the
browse cards, which were text-only until now** — the biggest visual change the
marketplace has had.

- **`Salon.coverImageUrl` is gone**, replaced by `coverImageId` the same way
  `Staff.photoUrl` was. Migration `20260807190000_salon_cover_image`. That is both
  of M1's dead image columns now removed.
- **The size cap became per-kind.** `MAX_EDGE` is now `{ avatar: 512, cover: 1280 }`
  — an avatar renders at ~96px, a cover spans the full 1024px content column. A
  3000×2000 upload comes back **1280×853 and 2 KB**.
- **The replace/remove/cleanup dance is shared, not duplicated.** `readUpload`
  turns a posted file field into one of three intents — write, clear, or leave
  alone — and both `saveSalon` and `saveStaff` use it. `saveStaff` was refactored
  onto it and re-verified afterwards.

**Verified with 10 new browser checks** on top of the 13 for staff photos: upload
accepted, resized to the cover cap specifically (proving the two limits are really
distinct), aspect ratio preserved, replacing deletes the old row, **a save that
never touches the file input keeps the existing cover**, removal 404s, and the
detail page falls back cleanly with no cover. The staff suite was re-run after the
refactor and still passes. 9 images in the database against 9 references — **no
orphans**, so the lifecycle handling holds. Typecheck, lint and 68 tests clean.

⚠️ **Still placeholders.** `scripts/seed-sample-photos.ts` (renamed from
`seed-sample-staff-photos.ts`) now seeds both avatars and covers — abstract
gradients, not stock photography. The generated covers have the salon name baked
into the image, so the name appears twice on a card; that is an artifact of the
placeholder, not of the layout.

---

**Asked (2026-08-07):** *"allow the owners to put profile pictures or
individuals picture in their bio."* — scoped in follow-up to **staff photos**,
stored **in Postgres and served by a route** (chosen over object storage because it
needs no account, no keys and no bill, and behaves the same on Neon once deployed).

**Answered:** Owners can now upload a photo per team member on `/owner/staff`. It
appears beside their bio on the public salon page and in the owner's team list,
falling back to their initials when there is none.

- **`Staff.photoUrl` is gone.** It was modelled in M1, never written, and null on
  all six rows. Two ways to specify a photo would have been one too many, so it is
  replaced by `photoId` pointing at a new `Image` table (bytes, MIME, dimensions,
  size). Migration `20260807120000_staff_photo_images`.
- **Uploads are re-encoded, not just stored.** `server/images/store.ts` runs every
  file through sharp: EXIF rotation applied then stripped, resized to fit 512px
  without upscaling, re-encoded to WebP q78. A 1800×2400 JPEG came out **384×512
  and 0.4 KB**; all six seeded avatars together are **14 kB**. Stripping EXIF is
  not incidental — phone photos carry GPS, and staff photos should not quietly
  publish where they were taken.
- **The declared MIME type is treated as a claim, not a fact.** A `.png` containing
  text is rejected because sharp cannot decode it. SVG is refused outright: it is a
  document, it can carry script, and serving one from our own origin would be
  stored XSS.
- **It works with JavaScript off** — a plain `<input type="file">` in the existing
  Server Action form, which already posts `multipart/form-data`.
- **Lifecycle is handled.** Replacing or removing a photo deletes the old row;
  leaving the field empty keeps the current photo; a rejected upload leaves the
  existing one intact; and a rollback deletes bytes stored before the transaction
  opened, so nothing is stranded.
- Served by `/api/images/[id]` with `immutable` caching — safe because an id never
  changes what it points at — plus `nosniff`. **The route is deliberately
  unauthenticated**; these are public staff photos. It would need an owner check
  before being reused for anything private.

**Verified with 13 browser checks** driving a real upload end to end: accepted,
resized, served as WebP, cached immutably, visible on the public salon page,
junk file rejected *with a message that says why*, the existing photo surviving
that rejection, and removal returning 404. Typecheck, lint and 68 tests clean.

**Two mistakes worth recording.** The verification script clicked
`form button[type="submit"]`, which matched the **first** form on the page — a
"Deactivate" form — so it silently deactivated Layla while reporting `saved=1`.
Restored. Scope submit clicks to the form you mean (`form:has(input[name="photo"])`).
Separately, two Server Actions on one page have **two different action ids**, and
posting to the wrong one succeeds with a 303 while doing nothing at all.

⚠️ **The avatars now showing are placeholders**, from
`scripts/seed-sample-photos.ts` (demo only, idempotent, `--clear` removes
them, never overwrites a real upload). They are abstract gradient discs, not stock
portraits of people who do not exist.

---

**Asked (2026-08-07):** *"review the progress report and create the url for
me so i can see the process and replace as required."*

**Answered:** Reviewed (led with the entry below) and **brought the URL back**:
**`https://connections-vehicles-friday-country.trycloudflare.com`**.

No rebuild was needed — Docker Postgres was still up, the production server on
`:3111` had survived, and the only commits since the last build (`e3fc61c`,
`7dfdf01`) touch `PROGRESS.md` alone, so the running build already matched HEAD.
What had died was the **quick tunnel**: the `cloudflared` process was still alive
from 2026-08-04 but its hostname had expired and returned nothing. Killed it and
minted a fresh one — **this is the normal failure mode, and the process staying up
is not evidence the tunnel works. Always curl the hostname, not the process list.**

Re-verified rather than trusting the 200s: six routes respond, and all **12 browser
checks pass** against the new hostname (tiles paint, pin badge `★ 4.8`, popup reads
*"Rose Beauty Lounge ★ 4.8 · 4 reviews · 2.7 km away"*, picker prefills and rewrites
on click, Arabic renders RTL).

**Nothing was replaced or changed** — the request was to see it, and no specific
amendment followed. The open gaps are unchanged: no customer review-writing (so
every star on the site is still seeded), no real deployment, no Moyasar test call.

---

**Asked (2026-08-04):** *"i need the owner of the salon to be able to select
the location through maps"* — scoped in follow-up to: **owner picks the location,
and customers see what is near them and the ratings of the salons near them.**
Provider chosen by the owner: **Leaflet + OpenStreetMap** (no API key, no billing).

**Answered:** Built all three parts. `Salon.lat`/`lng` had existed since M1 but
**nothing ever wrote them** — `saveSalon` dropped the fields — so the columns were
dead. They are now the backbone of the feature.

- **Owner picker** (`src/components/map/location-picker.tsx`) on `/owner/profile`:
  drag the pin, click the map, search an address (Nominatim, biased to `sa`), or
  use the browser's location. **Degrades to two plain number inputs with JS off** —
  those inputs are the source of truth and the only thing posted, so the map is a
  nicer way to fill them, not a second code path. `saveSalon` now validates and
  stores the pair; blank clears it, and **half a coordinate stores neither**.
- **Customer "near me"** on `/salons`: a `NearMeButton` writes `?lat=&lng=` into
  the URL and the **server** does the rest, so results stay shareable and
  back-button-correct. Proximity is a two-step filter — a bounding box in SQL
  (new `@@index([status, lat, lng])`; there is no PostGIS) then exact Haversine
  in JS to trim the box's corners and sort nearest-first. A radius selector
  (2/5/10/25/50 km) rides along as hidden fields so other filters do not drop it.
- **Ratings** now appear on browse cards and in map popups. They were **0.0 on
  every salon**: `avgRating`/`reviewCount` are denormalised and nothing maintained
  them. Added `recomputeSalonRating` (`src/server/salon/rating.ts`), which
  recomputes the aggregate from `Review` rows and accepts a transaction client.
- **Dark basemap.** OSM ships light tiles; against this near-black theme that was
  a glaring white rectangle. Filtered to a dark map via `.leaflet-tile-pane` —
  **not** `.leaflet-tile`, because Leaflet's own CSS declares
  `.leaflet-tile { filter: inherit }` and loads later, which is exactly the hook
  that declaration exists to provide.

**Verified — and this time actually looked at.** The long-standing
Playwright/WebKit mismatch was fixed by installing **Chromium**, so the "never
screenshot-verified" caveat carried since 2026-07-27 is **closed**. 12 automated
browser checks pass against the live tunnel: tiles paint, the pin renders with its
rating badge (`★ 4.8`), the popup reads *"Rose Beauty Lounge ★ 4.8 · 4 reviews ·
2.7 km away"*, the picker prefills the saved pin, clicking the map rewrites the
latitude, and the Arabic page renders RTL. Server-side round-trips confirmed
against Postgres: a moved pin persists, a cleared pin nulls both columns and drops
the salon out of "near me", and a 2 km radius correctly excludes a salon 2.7 km
away. 68 unit tests pass (**25 new**, over Haversine, bounding boxes and coordinate
parsing), typecheck and lint clean.

**Two things the screenshots caught that the assertions did not:** the "Show all
salons" button was stretching to full page width (fixed), and **I corrupted the
Rose salon's Arabic copy** — my verification `curl` posts ran through Git Bash,
which mangles UTF-8 arguments to `?`, exactly as this file's environment notes
warn. Repaired by piping UTF-8 SQL to `psql` from a file. Worth remembering: that
trap bites writes, not just reads.

⚠️ **The ratings are seeded, not earned.** `scripts/seed-sample-reviews.ts` (demo
only, not in git's product path, idempotent) creates completed bookings with
reviews for all three salons — because `Review.bookingId` is required and unique,
a review cannot exist without a real visit, which is why this cannot live in
`prisma/seed.ts`. **Nothing in the app creates a review yet**, so
`recomputeSalonRating` currently has no production caller. Customer review-writing
is still the open gap it was before.

---

**Asked (2026-08-04):** *"please review the progress report and produce url
for the project so we can amend and improve."*

**Answered:** Reviewed (led with the section below, as instructed) and **brought a
browsable URL back up**: started Docker Postgres, re-synced source to
`C:\temp\salon-hub-live`, clean production build, `next start -p 3111`, Cloudflare
quick tunnel → **`https://treasure-satin-jones-usd.trycloudflare.com`**. Smoke-tested
`/en`, `/ar`, `/en/salons`, a salon detail page and `/en/auth/login` (all 200), plus
an **authed** check as `owner.rose` confirming the revenue chart still renders after
the rebuild. ⚠️ Same ephemeral tunnel as before — hostname rotates on relaunch, dies
when the laptop sleeps. The **durable** URL (Vercel + Neon) is still owed and still
blocked on `vercel login` + a Neon connection string.

**Found while verifying — the revenue chart's window has rolled forward.** The demo
seeder spread bookings Feb–Jul 2026; the chart shows a trailing 6 months, so as of
2026-08-04 it reads *Mar 77 / Apr 357 / May 221 / Jun 128 / Jul 77 / **Aug 0*** —
February has fallen off the left and August renders as an empty slot (5 bars, not 6).
Not a bug in the chart, which is behaving exactly as specified; it is the **demo data
going stale**. Re-run `scripts/seed-sample-revenue.ts` with months rebased on *today*
(or make it seed relative to `now()`) before showing the chart to anyone, or the
newest month always reads zero.

---

**Asked (2026-07-27):** *"in the overview I need a chart representing the
revenue tab."*

**Answered:** Added a **monthly net-revenue bar chart** to the owner **Overview**
(`/owner`), above the catalog prompt, with a link through to the Revenue tab.
Server-rendered inline SVG (`src/components/revenue-chart.tsx`) — **no client JS**,
matching the site — built to the dataviz method: single series so **no legend**
(the heading names it), one **brand-olive** hue for the bars, all text in **ink
tokens** (`fill-foreground` / `fill-muted`, never the series colour), a recessive
baseline, rounded bar tops, per-bar value labels (which double as the no-JS
accessible data) and an `aria-label` summary. The page buckets SUCCEEDED
`salonNet` by the booking's month over the last 6 months. The demo seeder was
updated to spread the sample bookings ~one per month (Feb–Jul), so the chart shows
a trend: Feb 128 / Mar 77 / Apr 357 / May 221 / Jun 128 / Jul 77 (SAR net).
Verified authed as `owner.rose` (6 bars + month/value labels + Arabic title
render; build clean). ⚠️ Structural verification only — not screenshot-eyeballed
(the Playwright/WebKit mismatch again), so the layout may want a glance. Committed
+ pushed.

---

**Asked (2026-07-27):** *"another option in the owner dashboard for
revenue."*

**Answered:** Added an **Owner → Revenue** tab (`/owner/revenue`). Reads the salon's
`Payment` rows (joined via the booking) and shows four tiles — **your earnings**
(Σ `salonNet` of SUCCEEDED), **gross processed** (`amount`), **platform fees**
(`platformFee`), and **paid-bookings** count — plus an *awaiting payout* pill (net
not yet linked to a `Payout`) and a recent-payments list. All money summed with
`Prisma.Decimal`, so no float drift. New `navRevenue` link in the owner layout and
`rev*` keys in the `Owner` namespace (en/ar, 80 keys each, sets identical).
Verified **authed** as `owner.rose` (logged in through the credentials flow): the
tab, tiles and nav link all render. A **demo seeder** (`scripts/seed-sample-revenue.ts`
— idempotent, tags rows with a marker note, looks records up by name/email) was
added and run: 6 paid + 1 refunded booking for the Rose salon, so the tiles now
show **net SAR 986 / gross 1,160 / fees 174 / 6 paid** with a refunded row in the
list. Demo-only data (not in git); the seeder is safe to re-run or delete.
Committed + pushed to the public repo.

---

**Asked (2026-07-27):** *"add a feature to add reviews for the website and
make it in the bottom of the website."*

**Answered:** Added a **website-testimonials** feature at the bottom of the landing
page — reviews *about Salon Hub itself*, which is **distinct from the still-unbuilt
per-salon review writing** (see "What is genuinely not done"). New `SiteReview`
model + migration `20260727162818_site_reviews` (name, rating 1–5, comment,
createdAt). Server action `createSiteReview` (`src/server/site-review/actions.ts`)
— zod-validated, **open submission (no login)**, redirects `/?review=ok|error#reviews`.
Server component `site-reviews.tsx`: a no-JS Server-Action form (name, star rating,
comment) plus gold-star review cards in dark glass, wired into the landing bottom
via `<SiteReviews>`. Bilingual `SiteReviews` namespace in en/ar (ICU plurals for
star counts). Verified end-to-end locally: a submitted review 303-redirects,
persists, and renders; error/empty states and the Arabic section all render; no
MISSING_MESSAGE. Committed + pushed to the public repo. ⚠️ Open submission is
spam-exposed (length caps only); one test review ("Sara A.") sits in the DB as a
visible example — delete it or gate the form behind `auth()` on request.

---

**Asked (2026-07-27):** *"link my existing GitHub repo and publish the whole
project publicly"* (after running `gh auth login` in their own terminal).

**Answered:** Done. Authenticated as **`alqaabdq-crypto`**, linked the existing
`salon-hub` repo as `origin`, and pushed the full history `master → main`. The
remote held only a placeholder *"Initial commit"* (`.gitattributes`), replaced via
`--force-with-lease` — nothing of value lost. Flipped the repo **private → public**.
Now live: **https://github.com/alqaabdq-crypto/salon-hub** (default branch `main`,
15 commits). Local `master` tracks `origin/main`, so future publishes are a plain
`git push` — no more auth setup.
⚠️ The public `README.md` still documents the demo passwords (`admin1234` /
`owner1234`), visible to anyone. Offered to scrub them — **not yet done.**

**Design shipped this session (all committed, all live on the tunnel):**
- **RedSun dark redesign** (from a Pinterest reference) — forced dark theme
  (`@custom-variant dark` + `.dark` on `<html>`, safe as every page is dark-aware),
  near-black surfaces (`--background #0a0b07`), bright olive accent
  (`--color-brand #b6d94a`), dark-text button, and a glowing rising-sun arc
  (`.sun-disc`/`.sun-wrap`). Centred hero: pill → white headline → dual CTAs → sun →
  floating glass app bar, with sun + bar parallaxing to the cursor. Dark contrast
  ≥ 7:1. ⚠️ **Never screenshot-verified** (Playwright/WebKit version mismatch) — the
  sun-glow may want visual tuning.
- **3D / interactive layer** — `.scene` / `.glass` / `.shadow-depth` / `.card-3d`,
  floating orbs, `fade-up` entrances, all behind a `prefers-reduced-motion` guard.
  The hero is the only JS surface; the booking flow stays no-JS.
- **Colour** — olive palette (replaced an initial rose/violet "colourful" system).
  Unused `card*` keys in the `Home` namespace are harmless leftovers.

**Live tunnel (ephemeral):** the Cloudflare quick-tunnel hostname **changes on
every relaunch** and dies when the laptop sleeps (last live 2026-08-26:
`answer-extended-per-inc.trycloudflare.com`). Hard-refresh (Ctrl+Shift+R)
after any redeploy to clear old CSS; it exposes the machine + local DB while up.

**Still owed:** the *durable* URL (Vercel + Neon, ~15 min, blocked on `vercel login`
+ a Neon connection string). Optional follow-ups: scrub the demo passwords from the
now-public README; visually tune the sun-glow.

---

### Prior requests

- **2026-07-26:** *"colors to be white and oily green"* — token-only `globals.css`
  recolour to the current olive palette (brand `#556b1a`, accent `#7d9b2f`),
  contrast-verified. Still current.
- **2026-07-26:** *"integrate with claude design and make the url more colorful"* —
  built the token-driven brand system + utilities (`.btn-brand`,
  `.text-gradient-brand`, `.card-surface`) across every public surface. Recoloured
  since, but the structure stands.
- **2026-07-23:** *"deploy this in URL so i can browse it"* → deployment-readiness
  (fixed the gitignored-Prisma-client build blocker; guarded the seed;
  fast-forwarded `master`) plus a first Cloudflare tunnel. Durable URL still owed.

---

## Product decisions

Confirmed 2026-07-19. Binding for schema work. All three are now implemented in
the schema (M2).

| Decision | Choice |
| --- | --- |
| Catalog content | **Fully bilingual** — salon, service, category and staff copy all carry `en` + `ar` variants. Arabic is not just app chrome. |
| Booking shape | **Multi-service** — one booking holds many services (cut + colour + blow-dry). Price and duration are sums over items. |
| Revenue model | **Hybrid** — commission per booking *and* a premium subscription tier for salons. |

---

## Milestone status

Renumbered 2026-07-19. Only two points were ever anchored in the repo: `Milestone 1`
in the M1 commit, and `M5 integrates Moyasar` in the schema. The schema work done
this session originally squatted on the M2 slot; it is now **M1.2**, so M2 means
what a roadmap would naturally expect — the customer-facing product. M5 stays
payments, as originally planned.

| Milestone | Scope | Status |
| --- | --- | --- |
| M1 | Foundation — scaffold, auth, RBAC, i18n, MVP schema | ✅ Shipped (`9d59dad`) |
| M1.1 | Review fixes — auth blocker, timezone, money, fonts, docs | ✅ Shipped (`10f4a5d`) |
| M1.2 | Schema — bilingual catalog, multi-service bookings, revenue models | ✅ Shipped (`10f4a5d`) |
| M2 | Customer marketplace — app shell, browse, search, salon detail | ✅ Shipped (`b0dfd0b`) |
| M3 | Booking engine — availability, overlap prevention, booking flow | ✅ Shipped (`2b86988`) |
| M4 | Salon owner + admin dashboards | ✅ Shipped (`ee46d52`) |
| M5 | Payments via Moyasar | ✅ Shipped (`ee46d52`) — needs live keys to exercise |
| M6 | Design & product layer — dark theme, website testimonials, owner revenue tab + chart | ✅ Shipped (`2ccee68`) |
| M7 | Location & discovery — owner map picker, proximity search, ratings surfaced | ✅ Shipped (`05ed9f1`) — ratings shown are seeded |
| M8 | Photos — staff avatars and salon covers: upload, resize/re-encode, serve from DB | ✅ Shipped — images shown are placeholders |
| M9 | Customer service — support tickets, admin reply queue | ✅ Shipped — no notifications, so replies are pull-only |
| M10 | Admin revenue — platform commission, per-salon earnings | ✅ Shipped — figures come from seeded payments |
| M11 | HudHud Maps — MapLibre migration, provider abstraction, server-side geocoding | ❌ **Built and reverted the same day** (2026-08-25) at the owner's request, pending a HudHud account. Not in the tree. |
| M12 | Brand — renamed Salon Hub → **Fade** (both locales), brush-script wordmark | ⚠️ Live on the tunnel, **uncommitted**. Superseded by M13; the wordmark mechanism is unchanged. |
| M13 | Brand — renamed Fade → **book-ly** (both locales), same brush wordmark | ⚠️ Live on the tunnel, **uncommitted**. Repo, package, database and demo logins still carry the original name by choice. |
| M14 | Identity — two-face wordmark (Minion-class serif + Kanit Black Italic), shears mark knocked out of the brand chip, site icon, 3D pointer-tracking lockup | ⚠️ Live on the tunnel, **uncommitted**. Minion Pro itself needs an Adobe Fonts kit; Crimson Pro stands in. |
| M15 | Launch hardening — webhook amount check, CVE upgrades, customer reviews, review-form auth, rate limiting | ⚠️ Live on the tunnel. Five of the ten launch blockers found in the 2026-09-05 audit; the other five need the owner's accounts or a commercial decision. |

**All seven original milestones are covered.** The first plan's M6 (reviews) and M7
(polish, SEO, deploy) were dissolved by the 2026-07-19 renumbering: review *display*
shipped with M2, review *writing* has not been built, and deployment has not been
attempted. See "What is genuinely not done" below.

⚠️ **The M6 and M7 rows above are not those original milestones — the numbers were
free and the sequence simply continued.** Both are work that came after the plan
ran out, requested session by session rather than scoped up front:

- **M6** is the 2026-07-27 UI and product session. Detail under "Completed
  2026-07-27".
- **M7** is the 2026-08-04 maps session, and it is the first milestone that ships
  with a visible gap behind it: browse cards and map pins show star ratings, and
  every one of them comes from a demo seeder, because nothing in the app writes a
  review. Detail under "Completed 2026-08-04".
- **M10** is admin revenue, 2026-08-08: platform commission totals and a per-salon
  earnings table. Reuses the M6 revenue chart. Every figure rests on seeded
  payments — Moyasar has still never been called.
- **M9** is customer service, 2026-08-07: platform support tickets with an admin
  reply queue. Complete and verified end to end, but **pull-only** — with no
  notifications, a reply is discovered by revisiting `/help` and a ticket by
  opening the queue.
- **M8** is photo uploads, 2026-08-07 — staff avatars first, salon covers the same
  day, both on the same `Image` table and route. The feature is complete and owners
  can really upload, but every image currently on screen is a placeholder from a
  demo seeder, so the same "looks finished, is seeded" caution applies as for M7's
  ratings. Detail in the two latest entries at the top of this file.

Neither was anchored in a commit message the way `Milestone 1` and `M5 integrates
Moyasar` were, so these numbers live only in this file. Treat the commit hashes,
not the numbers, as the durable reference.

**M2 breakdown** — all four parts built 2026-07-19:

1. ✅ App shell — header, nav, locale switcher (wires the previously unused `Nav` keys).
2. ✅ Seed data — plans, bilingual categories, three approved salons with services,
   staff and working hours.
3. ✅ Browse and search — filter by city, gender focus, category, plus text search.
4. ✅ Salon detail — services, team, opening hours, reviews.

### Branch

**`master` now holds everything**, fast-forwarded from `feat/m2-marketplace` on
2026-07-23 as part of getting the project deployable — a host deploys the default
branch, and that branch was still sitting on M1. Both refs point at the same
commit; `feat/m2-marketplace` is kept only as a historical label and can be
deleted.

The M1-era note below is retained because it explains the commit shape:

Two commits, not the three the milestones suggest. `prisma/schema.prisma` and
`src/app/[locale]/layout.tsx` each carry changes from more than one milestone, so
an M1.1/M1.2 split would have produced a commit that does not build. They are
squashed into `10f4a5d`; M2 is `b0dfd0b`. Both commits build standalone —
verified that `10f4a5d` has no references to files introduced later.

`.env` was also edited (`NEXTAUTH_URL` removed) but is gitignored, so **every
deployed environment needs that variable removed by hand** — the repo cannot carry
that change for you.

M3 sits on the same branch. All migrations are already applied to the local
database; anyone pulling these changes runs `npx prisma migrate dev` to catch up.
The M3 migration creates the `btree_gist` extension, which needs a role that may
create extensions — on a managed Postgres that is not always the app's own user.

---

## Completed 2026-08-04 — M7: maps, proximity search, real ratings

Committed to `master` and pushed to the public `origin/main`; HEAD `05ed9f1`.
Provider decision taken by the project owner: **Leaflet + OpenStreetMap**, chosen
over Google Maps because it needs no API key and no billing account. Google was
rejected on that basis, not on data quality — OSM's Arabic POI labels are patchier
and its rural detail is thinner, which is the trade accepted here.

### Where the JavaScript now is

Earlier entries in this file say **"the hero is the only JS surface."** That is no
longer true, and the correction matters when judging what still works without
JavaScript. There are now three client components beyond auth: the hero, the owner
**location picker**, and the customer **map + Near-me button**.

What has *not* changed is the rule behind that claim. **Every one of these is an
enhancement over something that already works server-side**: the picker sits on top
of number inputs that post on their own, and the map only draws salons the server
already chose and listed. The **booking flow remains entirely no-JS**, and browse,
filters and salon detail still render and function with scripting disabled — a
visitor without JavaScript loses the map, not the marketplace.

### The dead columns

`Salon.lat` / `Salon.lng` were added in the M1 schema and **never written**:
`saveSalon` simply did not carry the fields, so every salon in every database had
a null location. Nothing surfaced this because nothing read them either. All three
pieces below rest on those columns, so filling them was the first job.

### Owner picks a location

`src/components/map/location-picker.tsx`, on `/owner/profile`. Drag the pin, click
the map, search an address, or use the browser's location.

- **It degrades.** Two plain number inputs sit under the map, always rendered, and
  they are both the source of truth and the only thing posted. With JavaScript off
  the form still saves a location; the map is a nicer way to fill those inputs, not
  a separate path. The inputs hold **raw text**, not parsed numbers — a controlled
  numeric input backed by a parsed value cannot be cleared or half-typed, because
  `""` and `-` both fail to parse and the keystroke is rejected.
- **Address search** is Nominatim, `countrycodes=sa`, fired on submit only — never
  on keystroke, which keeps it inside Nominatim's one-request-per-second policy
  without any debouncing. **The OpenStreetMap attribution in the corner is a
  licence condition, not decoration; do not remove it.**
- **Validation.** Blank clears the location. **Half a coordinate stores neither** —
  a latitude with no longitude would otherwise pin the salon to the prime meridian.
  A point outside the Saudi bounding box warns but still saves, because the common
  mistake is transposing lat and lng, and a warning is more useful than a refusal.

### Customers find what is near them

The `NearMeButton` does one thing: write `?lat=&lng=` into the URL. **The search
itself is server-rendered**, so a proximity result is shareable, bookmarkable and
back-button-correct, and anyone arriving with those parameters already set gets the
same page. Geolocation is how the parameters get filled, not a second code path.

Proximity is two steps, because there is **no PostGIS** here:

1. A **bounding box** in SQL — an index range scan over the new
   `@@index([status, lat, lng])`. Cheap and deliberately generous: a box drawn
   round a circle includes area the circle does not.
2. **Exact Haversine in JS**, which discards the box's corner over-selection and
   sorts nearest-first. Capped at 200 rows so a hand-edited URL cannot turn this
   into an unbounded read.

Salons with no pin are excluded outright — a salon with no location cannot be
distance-ranked, and the browse page says how many were left off the map.

### Ratings that are not zero

`avgRating` and `reviewCount` are denormalised onto `Salon` so browse can sort by
rating without a join. Denormalised means something must maintain them, and until
now **nothing did** — every salon read 0.0 no matter how many reviews it had.
`recomputeSalonRating` (`src/server/salon/rating.ts`) recomputes both from the
`Review` rows and takes an optional transaction client so it can run inside the
same transaction as a review write. It recomputes rather than nudging a running
average, which would drift the moment a review is edited or deleted.

Ratings now render on browse cards and inside map popups. **See the caveat under
"What is genuinely not done": nothing in the app writes a review, so this function
has no production caller yet and the visible ratings are seeded.**

### A dark basemap

OSM ships one light tile set, which against `--background #0a0b07` was a glaring
white rectangle. Tiles are inverted and hue-rotated into a dark map. The filter is
set on **`.leaflet-tile-pane`**, not `.leaflet-tile` — Leaflet's own stylesheet
declares `.leaflet-tile { filter: inherit }` and loads after the app's CSS, so a
rule on the tile itself is silently overwritten. Inheriting from the pane is the
hook that declaration exists to provide. Leaflet's controls and attribution are
restyled to the project's tokens; markers and popups sit in other panes and keep
their own colours.

### Demo reviews — local only, not product data

`scripts/seed-sample-reviews.ts`: 9 reviews across the three salons (Rose 4.75,
Al Fursan 4.33, Glow 4.00), idempotent, marker-tagged, cleared on re-run. It has
to create a completed booking per review because **`Review.bookingId` is required
and unique** — a review cannot exist without a real visit, which is exactly why
this cannot live in `prisma/seed.ts`, whose whole point is to create no bookings.
It recomputes the aggregates through `recomputeSalonRating` rather than writing
them by hand, so a bug in that function shows up here immediately.

`prisma/seed.ts` now carries coordinates for the three salons and **backfills them
on re-seed** (its `update` clause, previously empty), so an existing database does
not keep three salons that can never appear in a proximity search.

### Verified — including, at last, with eyes

The Playwright/WebKit version mismatch that left the last two sessions'
UI work "structurally verified only" was fixed by installing **Chromium**. That
caveat is **closed**, and it paid for itself immediately (see below).

- **68 unit tests** (25 new) over Haversine against known Riyadh–Jeddah and
  Riyadh–Dammam distances, bounding-box containment on the compass rose, the
  longitude-span widening with latitude, pole clamping, and coordinate parsing
  including transposed pairs and out-of-range values.
- **12 browser checks** against the live tunnel: tiles paint, the pin carries its
  rating badge (`★ 4.8`), the popup reads *"Rose Beauty Lounge ★ 4.8 · 4 reviews ·
  2.7 km away"*, the picker prefills the saved pin, clicking the map rewrites the
  latitude input, and the Arabic page renders RTL.
- **Server round-trips against Postgres**: a moved pin persists through the Server
  Action; a cleared pin nulls both columns and the salon drops out of proximity
  results; a half-coordinate post stores neither; a 2 km radius correctly excludes
  a salon 2.7 km away that a 10 km radius includes.

**Two defects the screenshots caught that the HTTP assertions did not:** the "Show
all salons" button was stretching to full page width, and the Rose salon's Arabic
copy had been **corrupted to `???????`** by the verification `curl` posts — Git
Bash mangles UTF-8 in command arguments, a trap this file already documented for
*reads* and which turns out to bite *writes* far harder. Both fixed; the note is
now in "Environment notes".

---

## Completed 2026-07-27 — M6: publish, redesign, reviews, revenue

A UI/product session layered on the finished M1–M5 core. Everything below is
committed to `master` and pushed to the public `origin/main`; HEAD `2ccee68`.

### Published to GitHub (public)

Linked the owner's existing `salon-hub` repo, pushed the full history
`master → main` (replaced a placeholder "Initial commit" via `--force-with-lease`),
and flipped it **private → public**: `github.com/alqaabdq-crypto/salon-hub`.
`master` tracks `origin/main`, so publishing is now a plain `git push`. ⚠️ The
README still lists the demo passwords (`admin1234` / `owner1234`), now publicly
visible — scrub offered, not yet done.

### Design — RedSun-style dark theme

Iterated colourful → white/olive → a dark, near-black "RedSun" look (from a
Pinterest reference), keeping olive as a bright accent. Dark is forced site-wide
via a class variant (`@custom-variant dark` + `.dark` on `<html>`), safe because
every page was already dark-aware. Near-black surfaces (`--background #0a0b07`),
bright accent (`--color-brand #b6d94a`), dark-text primary button. Landing hero
rebuilt centred: pill badge → white headline → dual CTAs → a glowing olive "sun"
arc (`.sun-disc`/`.sun-wrap`) → a floating glass app bar, with sun + bar
parallaxing to the cursor. Depth/motion utilities (`.scene`, `.glass`,
`.shadow-depth`, `.card-3d`, orbs, `fade-up`) behind a `prefers-reduced-motion`
guard; the hero is the only JS surface. Dark contrast ≥ 7:1. ⚠️ Never
screenshot-verified (Playwright/WebKit mismatch) — the sun-glow may want tuning.
**Both caveats are now out of date:** the hero stopped being the only JS surface
with M7 (see "Where the JavaScript now is"), and the sun-glow has been visible in
every landing screenshot since 2026-08-25 and reads correctly.

### Website reviews (testimonials)

New `SiteReview` model + migration `20260727162818_site_reviews` (name, rating 1–5,
comment, createdAt). A "Loved by our community" section at the **bottom of the
landing page**: a no-JS Server-Action form (name, star rating, comment) plus
gold-star review cards in dark glass, bilingual (`SiteReviews` namespace, ICU
plurals). `createSiteReview` is zod-validated, **open submission (no login)**.
Verified end-to-end (submit → 303 → persist → render; error/empty/Arabic states).
Distinct from the still-missing per-salon review writing. ⚠️ Open submission is
spam-exposed; one test review ("Sara A.") left in the DB as a visible example.

### Owner Revenue tab

New `/owner/revenue`: four tiles — your earnings (Σ `salonNet` on SUCCEEDED), gross
processed, platform fees, paid-bookings count — an *awaiting payout* pill, and a
recent-payments list. Money summed with `Prisma.Decimal`. `navRevenue` link added
to the owner layout; bilingual `rev*` copy. Verified authed as `owner.rose`.

### Owner Overview revenue chart

Server-rendered inline SVG (`src/components/revenue-chart.tsx`): monthly net
revenue for the last 6 months on `/owner`, linking to the Revenue tab. Built to the
dataviz method — single series (no legend), one brand-olive hue, text in ink tokens,
recessive baseline, rounded bars, per-bar value labels + `aria-label` summary. The
page buckets SUCCEEDED `salonNet` by the booking's month. ⚠️ Structural
verification only (not screenshot-eyeballed).

### Demo revenue data — local only, not in git

`scripts/seed-sample-revenue.ts` — idempotent (marker-tagged rows, cleared on
re-run), resolves salon/services/staff/customers by name/email. Seeds 6 paid + 1
refunded booking for the Rose salon spread ~one per month, so the tiles
(net SAR 986 / gross 1,160 / fees 174 / 6 paid) and the chart (Feb–Jul trend)
populate. Demo-only; safe to re-run or delete.

---

## Completed 2026-07-23 (second session) — M4 and M5

### The invariant became a function

M3 left a rule everyone had to remember: change `Booking.status` and you must
change `BookingItem.status` with it, or cancelled visits keep reserving staff.
M4 turns that into `setBookingStatus` in `src/server/booking/status.ts`, the only
supported way to move a booking. It owns the transition table too:

| From | May become |
| --- | --- |
| `PENDING` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `COMPLETED`, `NO_SHOW`, `CANCELLED` |
| terminal | nothing |

**Nothing returns to a blocking status.** Reviving a cancelled booking would ask
the database for a slot someone else has very likely taken, and the EXCLUDE
constraint would refuse it at the worst possible moment. A customer who changes
their mind books again.

### M4 — owner dashboard

`/owner` with overview, bookings, services, team and profile. A salon owner signs
up before they have a salon, so every page copes with there being nothing to
manage yet, and the profile form doubles as the create-salon form. New salons
start `PENDING_VERIFICATION` and are invisible to customers until an admin
approves them.

Staff identity, skills and shifts save in **one** form and one transaction: a
member with no services or no hours is invisible to the availability engine, so a
partial save would quietly produce someone who can never be booked.

Services are retired, never deleted — booking history snapshots the price but
still points at the row.

### M4 — admin

`/admin` is the verification queue plus a roster of every salon. Approving puts a
salon on the marketplace; suspending or rejecting takes it off **and cancels its
pending and confirmed bookings**, one at a time through `setBookingStatus`, so no
customer is left holding an appointment at a salon they can no longer find.

### M5 — payments via Moyasar

Hosted **Invoice** flow, not the tokenised card API: the customer is sent to a
Moyasar-hosted page, so no card data reaches this server and the flow still works
without client JavaScript.

- `money.ts` — all arithmetic in integer halalas, which is also Moyasar's wire
  format. The fee is rounded and the net is the remainder, so `fee + net` is
  always exactly the amount charged.
- Commission precedence is **salon override → plan rate → platform default
  (15%)**, resolved *at capture time* and never recomputed, so changing a rate
  later cannot alter what a salon is owed for work already paid for. Only an
  `ACTIVE` subscription buys its plan's rate.
- The webhook (`/api/payments/moyasar/webhook`) is the authoritative path;
  the customer's return redirect is a convenience that may never arrive. Both
  call the same idempotent `settleFromGateway`.
- The return page treats its own query string as attacker-supplied — anyone can
  visit it with `status=paid`. It re-reads the payment through the API with our
  secret key, and *that* is what gets recorded.
- Cancelling a paid booking refunds it. The slot is freed first; a gateway that
  refuses the refund surfaces an error rather than failing silently, because that
  is the case where money is still with us.

### P0 closed: unpaid holds expire

`HOLD_MINUTES = 20`. An unpaid `PENDING` booking older than that is cancelled for
real — a filter in the availability query would not have worked, because the slot
is reserved by the database constraint, which knows nothing about wall-clock
expiry. Swept from the availability path so the system heals on use with no cron
to deploy or forget, and skipped entirely when payments are unconfigured, since
an unconfigured deployment would otherwise cancel every booking it ever took.

### Verified

- 43 unit tests (11 new, over the money and commission maths — including that
  `fee + net` reconstructs the amount across awkward rounding).
- **39 end-to-end HTTP checks of the full lifecycle**: owner registers → creates
  a salon → hidden from browse and 404 by slug → admin approves → appears in
  browse → owner adds a service and a stylist with shifts → customer books at the
  brand-new salon → owner is offered Confirm but not Complete → confirms →
  webhook with the wrong secret is rejected 401 → with the right secret settles →
  split lands as `SUCCEEDED,15.00,85.00` → a redelivered webhook changes nothing
  → admin suspends → the confirmed booking *and its items* go `CANCELLED`.
- **Run on an iPhone profile in WebKit** (see below).

### Run on a phone

The iOS Simulator is macOS-only and cannot run on this machine. The closest
faithful substitute is Playwright's **WebKit** build with the iPhone 15 Pro
device profile — same engine family as Safari, 393×659 at DPR 3, touch input,
Mobile Safari UA. `scripts/iphone-run.mjs` drives it.

It completed a real booking by **tapping** a slot, and found two layout faults
that no desktop check would have:

1. The site header broke *mid-phrase* at 393px — "Salon Hub" and "Log out" each
   split across two lines. Fixed with `whitespace-nowrap` on every nav item and
   an explicitly wrapping row: wrapping the row is fine, wrapping a label is not.
2. The browse filters were a wrapping flex row, so a label could end up sitting
   above a field it did not belong to. Now a two-column grid on small screens.

Also asserted: no page scrolls horizontally in either language, Arabic lays out
RTL with real glyph widths (a missing webfont would show tofu), and no slot
button is under 32px tall.

---

## Completed 2026-07-23 (first session) — M3

### The blocking decision, settled

Overlap prevention needed `status` reachable from `BookingItem`. **Decision:
denormalise it.** `BookingItem.status` now mirrors its parent booking, which lets
the constraint live in the database:

```sql
EXCLUDE USING gist ("staffId" WITH =, tsrange("startTime", "endTime", '[)') WITH &&)
  WHERE ("status" IN ('PENDING', 'CONFIRMED'))
```

`tsrange`, not `tstzrange`, because Prisma maps `DateTime` to `timestamp(3)`
without a zone. `'[)'` so a visit ending at 12:00 does not collide with one
starting at 12:00. Partial, so a cancelled visit releases its slot and completed
history never blocks future bookings.

**The cost of the decision:** two rows now carry the same truth. Every mutation
that changes a booking's status *must* change its items' status in the same
transaction — `cancelBooking` does. The M4 owner dashboard (confirm, complete,
no-show) has to honour the same rule, or cancelled visits will go on reserving
staff. `BLOCKING_STATUSES` in `src/server/booking/schedule.ts` is the list the
constraint enforces; the two must stay in step.

The alternative — enforcing it only in the availability query — was rejected:
two customers can pass the same check concurrently and both insert.

### Availability engine

Split three ways so the logic is testable without a database:

- `src/server/booking/time.ts` — the only place Riyadh wall time and UTC instants
  meet. Fixed UTC+3: Saudi Arabia has never observed DST, so the offset is exact,
  not an approximation, and the engine stays free of the timezone database.
- `src/server/booking/availability.ts` — pure. Takes intervals in minutes past
  Riyadh midnight, gives slots out. Values outside 0–1440 are legal and load-
  bearing: a visit that started yesterday appears as a negative start and still
  blocks this morning.
- `src/server/booking/schedule.ts` — loads rows, calls the engine.

Multi-service visits run back to back, and a member committed to one service
never constrains a later one, so **no backtracking is needed** — first qualified
free member per service, in a stable order. A visit can span several people.

### Booking flow

`/[locale]/salons/[slug]/book` — services and date in the URL as a plain GET
form, then one small POST form per slot. **No client JavaScript anywhere in the
flow**; it works with JS disabled, and the basket survives a reload, a language
switch, or being shared. `/account` lists upcoming and past bookings and cancels
them.

The action recomputes availability from scratch and uses the posted start only to
pick which slot it just derived is wanted — the posted times are never written.
A slot taken between render and submit redirects back with `error=unavailable`;
one taken between the check and the insert is caught as the constraint violation
and redirects with `error=taken`.

### Tests

Vitest, `npm test`. 32 unit tests over the two pure modules — half-open interval
edges, split shifts, unqualified staff, overnight spillover, DST-free offset,
impossible dates. `npm run typecheck` added too.

### Verified

Against the seeded database and a production build:

- 15 database-level checks — the EXCLUDE constraint rejects an overlapping item
  and permits a back-to-back one; a cancelled item stops reserving its slot;
  Friday offers nothing; a past date offers nothing; today is cut off at the
  current minute.
- 17 end-to-end HTTP checks over the no-JS path — register, credentials login,
  book, appear in `/account`, cancel, Arabic RTL.
- 7 exhaustion checks — one booking at 10:00 does *not* remove the slot (the
  second stylist absorbs it), a second one does, and a stale post of the taken
  slot is refused rather than double-booked.

---

## Completed 2026-07-19

### M1.1 — review fixes

**Auth in production (was P0).** `trustHost: true` set in
`src/server/auth/config.ts`. Auth.js derives `trustHost` from `AUTH_URL` /
`AUTH_TRUST_HOST` / `VERCEL` / `CF_PAGES` / `NODE_ENV !== "production"` — never
from `NEXTAUTH_URL`, the only variable the project set. Every auth request in a
production build returned 500 `UntrustedHost`; `next dev` hid it.

**Request-origin rewriting.** `NEXTAUTH_URL` removed from `.env` and
`.env.example`. Setting it routed requests through Auth.js's `reqWithEnvURL`,
which rebased `req.url` onto the env origin — observed sending `GET /` on port
3111 cross-origin to `http://localhost:3000/en`. `trustHost: true` covers host
trust without it. **Do not reintroduce `AUTH_URL` / `NEXTAUTH_URL`.**

**Timezone.** Pinned to `Asia/Riyadh` in `src/i18n/request.ts`. It was inferred
from the server clock, so a UTC container would have shifted every booking time
three hours. Verified by running the server under `TZ=UTC`.

**Money precision.** `DECIMAL(65,30)` → `DECIMAL(10,2)` across all money columns
(migration `20260719144659_money_precision_decimal_10_2`).

**Fonts.** `globals.css` hardcoded `font-family: Arial` on `body`, overriding the
Geist variables — the whole app rendered in Arial, and no Arabic webfont was
loaded at all. Body now uses `var(--font-sans)`, and Noto Sans Arabic is loaded
with Arabic subsetting so Arabic resolves per-glyph after Geist.

**Docs.** `README.md` replaced (was create-next-app boilerplate) with setup steps,
env-var rules, the role model, and the vision. This `PROGRESS.md` added.

**`.env.example` had never been committed.** Found while staging `10f4a5d`:
`.gitignore`'s `.env*` pattern matched the template too, so it was absent from the
M1 commit and from every clone. The README's `cp .env.example .env` step would
have failed for anyone setting the project up fresh. Fixed by negating the pattern
(`!.env.example`) and adding the file. The real `.env` remains ignored — verified
no secret files are tracked.

### M2 — schema

Migration `20260719145203_m2_bilingual_catalog_multiservice_bookings_revenue`.

- **Bilingual catalog** — `nameEn`/`nameAr` and `descriptionEn`/`descriptionAr` on
  `Salon` and `Service`, `nameEn`/`nameAr` on `Category`, `bioEn`/`bioAr` on
  `Staff`. `slug` stays single: URL-safe Latin, shared across locales so links
  survive a language switch.
- **Multi-service bookings** — `Booking` split into `Booking` + `BookingItem`.
  Staff moved to the item, so one visit can span several people. `price` and
  `durationMinutes` are snapshotted per item, so repricing a `Service` never
  rewrites booking history. `Booking.startTime`/`endTime` are the denormalised
  envelope over items.
- **Revenue** — `Salon.commissionRate` (negotiated override), `Payment.platformFee`
  / `salonNet` (split resolved at capture time), `Payout` (period settlement
  linking the payments it covers), and `Plan` + `Subscription` for the premium
  tier. Commission precedence: **salon override → plan rate → platform default.**

Verified with a rolled-back transaction exercising a two-service, two-staff
booking with a 10% premium-plan commission split: item prices summed to the
booking total, Arabic fields round-tripped, payout linked to its payment.

### M2 — customer marketplace

Routes added: `/[locale]/salons` (browse) and `/[locale]/salons/[slug]` (detail).

- **App shell.** `SiteHeader` with brand, salons link, locale switcher and
  auth-aware actions (Log in / Sign up when signed out, Dashboard / Log out when
  signed in, routed by role). The locale switcher uses next-intl's locale-stripped
  `usePathname`, so switching preserves deep paths — verified
  `/en/salons/rose-beauty-lounge` ↔ `/ar/salons/rose-beauty-lounge`.
- **Bilingual content helper.** `src/i18n/content.ts` — `localized(row, "name", locale)`
  resolves the paired `nameEn`/`nameAr` columns with English fallback.
- **Filters** are a plain GET form: no client JS, and filter state stays shareable
  in the URL.
- **Approval gating** is enforced in both queries. A non-`APPROVED` salon 404s on
  its detail page and disappears from browse — verified by flipping a seeded salon
  to `PENDING_VERIFICATION` and back.
- **Prices** format per-locale through next-intl: `SAR 150` / `150 ر.س.‏`.
  Arabic plurals use full ICU categories (`صالون واحد` for one, not `1 صالون`).

**Trade-off taken:** `SiteHeader` calls `auth()`, so every route is now
server-rendered on demand (`ƒ`) rather than prerendered. The header is
account-aware on every page, and with the JWT strategy this is cookie verification
rather than a database round-trip. Revisit only if public catalog pages need CDN
caching — that would mean moving the auth-dependent part to a client component.

Seed now creates FREE/PREMIUM plans, five bilingual categories, and three approved
salons (Riyadh / Jeddah / Dammam, covering all three `GenderFocus` values) with
services, staff, and Saturday–Thursday 10:00–22:00 hours. It is idempotent —
verified by running twice with identical counts. Salon owner logins are
`owner.rose@`, `owner.fursan@`, `owner.glow@salonhub.sa`, password `owner1234`.

---

## Deployment

**Status: ready to deploy, never deployed.** The only browsable URL so far has
been a tunnel to a laptop (see the top of this file).

### What was fixed to make deployment possible

- **The build now generates the Prisma client.** `/src/generated/prisma` is
  gitignored, so a fresh clone — which is exactly what a cloud builder starts
  from — had no client and could not compile. `build` is now
  `prisma generate && next build`. `prisma generate` needs no database
  connection, so it is safe at build time. Verified by cloning the repo to a
  clean directory, installing, and building with `DATABASE_URL` unset entirely.
- **The seed refuses to publish its own passwords.** `admin1234` / `owner1234`
  are printed in the README, and the admin account can approve and suspend
  salons. Seeding a non-local database now throws unless `SEED_ADMIN_PASSWORD`
  and `SEED_OWNER_PASSWORD` are set. The check is the host in `DATABASE_URL`,
  not `NODE_ENV` — the seed is usually run by hand, where `NODE_ENV` says
  nothing useful.
- **`master` was fast-forwarded** to the full product. A host deploys the
  default branch, and it was still on M1.

### To get a durable URL (Vercel + Neon)

Blocked on two steps only the project owner can perform; everything after them is
mechanical.

1. `vercel login` — interactive, browser-based.
2. Create a free Neon Postgres and take the connection string. Neon supports the
   `btree_gist` extension the M3 migration needs, which is the thing most likely
   to fail on a managed database.
3. Set env vars on the project: `DATABASE_URL`, `AUTH_SECRET` (`npx auth secret`),
   `SEED_ADMIN_PASSWORD`, `SEED_OWNER_PASSWORD`. **Do not set `AUTH_URL` or
   `NEXTAUTH_URL`** — see the rule in the README; it breaks locale redirects on
   any host whose origin differs.
4. `npm run db:deploy` then `npm run db:seed` against the remote URL.
5. `vercel deploy --prod`.

Migrations are deliberately *not* in the build command. `prisma migrate deploy`
during a build means every preview deployment mutates the shared database, and
the `btree_gist` extension needs a role permitted to create extensions — a
failure better seen once, run by hand, than buried in build logs.

### The tunnel, for reference

```bash
cd /c/temp/book-ly-live && npx next start -p 3111       # production build, outside OneDrive
/c/temp/cloudflared.exe tunnel --url http://localhost:3111 --no-autoupdate
```

Quick tunnels need no Cloudflare account and mint a random `*.trycloudflare.com`
hostname per run — the URL changes every time, so it cannot be bookmarked. Auth
worked through it unmodified because `trustHost: true` is set and no `AUTH_URL`
is pinned; the login redirects came back on the tunnel hostname, not localhost.

---

## What is genuinely not done

The milestone table says shipped; this says what "shipped" does not mean.

- **Nothing has been tested against Moyasar.** Every payment path is exercised
  end to end against our own webhook handler with a seeded payment row, which
  proves the split, the idempotency and the auth check. It does not prove the
  request shape Moyasar actually accepts, because that needs `MOYASAR_SECRET_KEY`
  from a real dashboard. **Get test keys (`sk_test_…`) and run one booking
  through before believing the invoice call works.**
- ~~**Customers still cannot write *salon* reviews.**~~ **Closed 2026-09-08.**
  `createReview` (`src/server/salon/review-actions.ts`) writes one, the form sits
  on each past booking in `/account`, and `recomputeSalonRating` runs in the same
  transaction. Eligibility: your own booking, marked COMPLETED by the salon, one
  review each. ⚠️ **What is still true is that the ratings on the site *today* are
  seeded** — the write path exists, but no real customer has used it, so every
  number on a browse card and a map pin is still demo data until real traffic
  replaces it.
- **Nothing has ever been deployed.** No hosting, no CI, no migrations run
  anywhere but this laptop — the public URL so far was a tunnel *to* this laptop,
  which is not the same thing and proves nothing about a cloud environment. The
  `btree_gist` extension in the M3 migration needs a role permitted to create
  extensions, which on managed Postgres is often not the application's own user.
  The repo is now deploy-*ready* and **published publicly to GitHub** (2026-07-27),
  but it has still never been deploy-*ed* to a host.
- **No notifications, and support made this worse.** Neither the customer nor the
  salon is told anything outside the web UI, and as of 2026-08-07 that now includes
  support: a customer discovers a reply only by returning to `/help`, and an admin
  discovers a ticket only by opening the queue. A support channel nobody is paged
  about is a slow support channel. SMS/WhatsApp is near-mandatory in this market;
  email would be enough for support replies specifically.
- **The salon photo *gallery* is still not done.** Staff avatars and salon covers
  both ship as of 2026-08-07, but the `SalonPhoto` table remains modelled and
  unused — there is no multi-photo gallery, and no add/remove/reorder UI. The
  upload machinery is general, so this is mostly wiring plus ordering.
- **There is one rendition per image, and browse serves the big one.** A cover is
  stored at 1280px and the browse card displays it at ~360px wide. Harmless at
  three salons (37 kB of images in total); wasteful at a hundred. The fix is a
  thumbnail rendition at upload time, or a width parameter on the image route.
- **Images live in the database, which is a decision with a shelf life.** Fine at
  14 kB of avatars; wrong once salons upload galleries. There is no CDN and every
  byte is in backups. Moving to object storage means changing the write path and
  the one read route — kept deliberately narrow for that reason.
- **Only three salons have coordinates, and they are seeded ones.** "Near me"
  works, but it can only find what has been pinned. Any salon created through the
  owner form since 2026-08-04 has a pin only if its owner set one — the field is
  optional by design, and an unpinned salon is invisible to proximity search
  while remaining fully visible everywhere else.

## Open issues

### 🟠 P1

- **Prisma and bcryptjs are bundled into the proxy**, which runs on every
  request, because `src/proxy.ts` imports the full auth config. Auth.js v5's
  split-config pattern (edge-safe `auth.config.ts` + full `auth.ts`) fixes this.
  Not fatal — Next 16 proxy runs on the Node runtime — but it is per-request weight.

### 🟡 P2

- **Rate limiting covers four paths, not every write.** Login, registration,
  booking and site reviews are limited as of 2026-09-08; the support form, the
  owner's save actions and the salon review form are not. None of those is
  anonymous, so the exposure is an authenticated account being noisy rather than
  a stranger — but "authenticated" is cheap while registration is only IP-limited.
- **The limiter fails open.** If the `RateLimit` table errors, attempts are
  allowed through. That is the deliberate choice — failing closed locks every user
  out of the site over a table problem — but it means the limiter is not a
  security control you can lean on while the database is unhealthy.
- **Five `npm audit` highs remain, all inside the `prisma` CLI's dependencies**
  (`@prisma/config`→`deepmerge-ts`, `mysql2`, `nanoid`). They are reachable at
  `prisma generate`/`migrate` time, not from a request. The only fix is Prisma 8,
  which is a release candidate — revisit when it is stable. ⚠️ **Do not run
  `npm audit fix --force`**: it proposes *downgrading* Prisma 7 → 6.
- **No email verification and no password reset.** Anyone can register with an
  address they do not own, and anyone who forgets a password is locked out
  permanently. Both need the mail provider that does not exist yet.
- Logged-in users can still browse to `/auth/login` and `/auth/register`.
- **Browse has no pagination.** Fine for three seeded salons, wrong at scale —
  `findMany` is unbounded. Add cursor pagination before real listings land. The
  proximity path is capped at 200 rows; the unfiltered path is not capped at all.
- **Nominatim is a third-party dependency with a usage policy**, not an SLA. Its
  address search is capped at roughly one request per second, may rate-limit or
  block a noisy origin, and **requires the OpenStreetMap attribution** rendered in
  the map corner. Search is fired on submit rather than on keystroke to stay
  inside that budget, but a busy production site should self-host a geocoder or
  buy one. Losing it degrades gracefully: the pin can still be dragged.
- **Map tiles come from `tile.openstreetmap.org`**, whose tile-usage policy
  forbids heavy automated traffic. Same conclusion — fine now, needs a paid or
  self-hosted tile source before real traffic.
- **The proximity sort is JS-side and unindexable.** The bounding box is indexed;
  the Haversine ordering that follows is not, and cannot be without PostGIS.
  Correct and fast at this catalogue size, wrong shape for a national listing.
- **Text search is `contains`**, so it cannot match across `nameEn`/`nameAr` word
  order or handle Arabic diacritics and alef variants (`أ` vs `ا`). Postgres full-text
  search with an Arabic configuration is the real answer.
- ~~Salon cover images are modelled but nothing renders them.~~ **Stale — covers
  and staff avatars have rendered since 2026-08-07** (`coverImageId`,
  `Staff.photoId`). What is still unbuilt is the multi-photo **gallery**:
  `SalonPhoto` remains modelled and unused.
- Role matching is strict equality, so an `ADMIN` cannot view `/account` or
  `/owner`. Fine if deliberate, awkward for support work.
- ~~**A booking stays `PENDING` forever.**~~ **Stale — the owner dashboard has
  moved bookings since M4**: `updateBookingStatus` in `src/server/salon/actions.ts`
  takes CONFIRMED, COMPLETED, NO_SHOW and CANCELLED, and paying moves a booking to
  CONFIRMED on its own. COMPLETED now also gates the review form.
- **No booking notifications.** The customer sees a banner and nothing else; the
  salon is not told at all. SMS/WhatsApp is near-mandatory in this market.
- **Bookings can be made up to the current minute**, and cancelled up to the
  moment they end. Both want a product-decided lead time.
- Staff assignment takes the first free qualified member in name order, so the
  alphabetically-first stylist absorbs most of the load. Fine for correctness,
  poor for fairness — balance by load when it matters.
- `createBooking` accepts a `notes` field that no UI sends: one form per slot
  leaves nowhere to type it. Needs a confirmation step between slot and booking.
- The same service twice in one visit is rejected (the engine matches staff by
  service id, so a repeat is indistinguishable). Two haircuts for two people is a
  real request; it needs a quantity or a per-item identity.
- Availability is recomputed on every render of the booking page, uncached.
  Cheap at three salons; a `findMany` per staff member per page view later.
- **Only the pure modules have tests.** `schedule.ts` and the actions are covered
  by the throwaway scripts described above, not by anything that runs in CI.

### 🔵 P3 — deferred schema decisions

- Working hours exist only on `Staff`, never on `Salon`; availability needs both.
  The salon detail page works around this by showing the **union** of staff
  hours — the widest window anyone is available. That is a display approximation,
  not opening hours, and it will diverge the moment a salon's posted hours differ
  from its team's shifts. The booking engine has the same gap from the other
  side: it derives the bookable window purely from shifts, so a salon that closes
  early while one stylist stays late will sell slots after closing.
- `Prisma.Decimal` is used for money in the booking action, but the availability
  layer passes prices around as strings and the UI formats through `Number()`.
  Consistent enough at two decimal places; worth unifying before M5.
- `Staff` has no gender field despite `GenderFocus` on salons — likely required
  for women's salons in this market.
- ~~`lat` / `lng` unindexed~~ — indexed 2026-08-04 (`@@index([status, lat, lng])`)
  and "near me" ships, using a bounding box plus Haversine in JS. Still **no
  PostGIS**: that composite index cannot serve a true radius, and the JS sort is
  capped at 200 rows. Fine at this size; revisit before the catalog is national.
- **`city` is still free text and monolingual.** The Arabic browse page shows
  "Riyadh" in Latin script next to fully Arabic salon copy, because `Salon.city`
  has no `cityAr`. It is also what the city filter groups on, so a typo makes a
  new city. Worth a `City` table, or at minimum a bilingual pair.
- No notifications model (SMS / WhatsApp reminders are near-mandatory here).
- No OAuth adapter tables, despite `User.image` / `emailVerified` hinting that way.
- `Review.rating` has no 1–5 constraint; `avgRating` / `reviewCount` are
  denormalised with nothing maintaining them.
- `updatedAt` exists only on `Booking`, `Payment`, `Payout` and `Subscription`.
- Salon tier is derived through `Subscription` rather than denormalised onto
  `Salon`; revisit if search ranking needs to filter on it cheaply.

---

## Environment notes

- ⚠️ **After renaming the project directory or the package, delete `.next`.**
  Prisma 7 generates its client against a hashed package identity
  (`@prisma/client-<hash>`), and that hash moves with the name. Regenerating is
  **not** enough: on 2026-09-08 the rebuilt server still 500'd with *Cannot find
  module @prisma/client-47c0a585693bfa7b/runtime/client* because the stale
  reference lived in **Turbopack's persistent cache** under
  `.next/cache/turbopack/`, which fed it back into every rebuild. `rm -rf .next`
  and one build fixed it.
- **Git Bash `mv` can refuse a folder inside OneDrive** with *Device or resource
  busy* while PowerShell's `Rename-Item` succeeds on the same path, same moment.
  Reach for `Rename-Item` rather than hunting for the handle.
- ⚠️ **`npm audit fix --force` would downgrade this project.** Run on
  2026-09-08 it proposed **prisma@6.19.3** — a major version *backwards* from the
  7.x this schema and generated client are built against — to clear advisories in
  the CLI's own dependencies. Upgrade the named packages by hand instead
  (`npm install next@… next-auth@… sharp@…`) and re-run `npm audit --omit=dev`
  to see what actually moved. **Read what `--force` intends to install before
  running it; it optimises for a clean report, not a working build.**
- **A build in `C:\temp\book-ly-live` must go through `npm run build`, not
  `npx next build`.** The script is `prisma generate && next build`, and after a
  schema change the copy's generated client is stale — `next build` alone fails
  type-checking on the new columns while the source tree, which was generated
  after the migration, passes. Cost a confusing failure on 2026-09-08.
- **The Postgres role is `salonhub`, not `postgres`, and settled money is
  `SUCCEEDED`.** `docker compose` sets `POSTGRES_USER: salonhub`, so
  `psql -U postgres` fails with *role "postgres" does not exist* — use
  `docker exec salon-hub-postgres-1 psql -U salonhub -d salonhub`. And the
  `PaymentStatus` enum is `PENDING | SUCCEEDED | FAILED | REFUNDED`: there is **no
  `SETTLED`**, despite every revenue note in this file (correctly) calling those
  rows "settled". The money columns are `amount`, `platformFee`, `salonNet` — not
  the `…Amount` names. Both cost a query on 2026-09-05.
- **Never write a `tar` that depends on the shell's working directory.** The Bash
  tool's cwd resets to `C:\Users\Admin` between calls. On 2026-08-07 a
  `tar cf - … .` intended for the project archived the **entire home directory**
  into `C:\temp\salon-hub-live`, which then had to be purged with
  `robocopy /MIR` from an empty folder (plain `Remove-Item -Recurse` stalled on
  locked files under the copied `AppData`). No source was harmed — tar only reads
  — but the build copy was destroyed. **Always `tar -C <absolute-project-path>`**,
  which makes the source explicit and the cwd irrelevant.
- **Building inside OneDrive silently serves stale code.** Worse than the `EPERM`
  noted below, and it cost most of an hour on 2026-07-23. OneDrive treats files
  the build is writing under `.next` as edit conflicts: it renames the new file
  to `<name>-DESKTOP-XXXXXXX.js` and restores the *previous* version under the
  original name. The build reports success, `next start` then serves a mix of new
  and old chunks, and nothing anywhere errors. The symptom was an Arabic page
  rendering `Booking.title` — a message catalog chunk from the last build paired
  with this build's page code.
  - **Detect it:** `find .next -name "*DESKTOP*"` after a build. Any hit means
    the build output is untrustworthy.
  - **Fix it:** verify from a copy outside the synced tree. `distDir` does not
    help — Turbopack rejects a path that navigates out of the project root:
    ```bash
    tar cf - --exclude=node_modules --exclude=.next --exclude=.git . \
      | (mkdir -p /c/temp/salon-hub-verify && cd /c/temp/salon-hub-verify && tar xf -)
    cd /c/temp/salon-hub-verify && npm install && npm run build && npx next start -p 3111
    ```
    A junction back to the real `node_modules` does not work either — Turbopack
    refuses a symlink pointing out of the project root. It needs its own install.
- **`EPERM` on `.next`** for the same underlying reason: OneDrive holds handles
  while syncing. `rm -rf .next` and rebuild.
- `next dev` and `next build` both write to `.next/` and collide. Stop the dev
  server before building.
- Auth and i18n bugs here are invisible under `next dev`. Verify with
  `npm run build && npx next start`.
- `.gitattributes` now pins `* text=auto eol=lf`, so the CRLF warnings on staging
  no longer mean phantom diffs for the next machine to clone.
- Testing Arabic from Git Bash on Windows is unreliable — the shell mangles UTF-8
  arguments to `?` before curl sends them, which looks exactly like a broken
  search query. Use percent-encoded URLs when testing Arabic input, and assert on
  Arabic *output* from a `.mjs` file rather than `grep`/`node -e` with the string
  inline, which mangles it the same way.
- **Server Action forms post `multipart/form-data`.** Driving the no-JS path with
  curl needs `-F`, not `--data-urlencode`; a urlencoded post is ignored and the
  page simply re-renders as though nothing happened. The action id travels as an
  empty hidden field named `$ACTION_ID_<hash>`, which the rendered HTML contains.
- **next-intl serialises the whole message catalog into the HTML.** Grepping a
  page for an English string can match the untranslated catalog rather than
  anything rendered — anchor assertions on markup (`>Cancelled<`) instead.
- **Git Bash mangles UTF-8 in *writes*, not just reads.** A verification `curl -F
  "nameAr=صالون…"` on 2026-08-04 wrote literal `???????` into the database. The
  same trap already documented for search queries applies to any Arabic sent as a
  shell argument. Send Arabic from a **file** (`psql -f`, a `.mjs` script, curl
  `--data-binary @file`), never inline.
- **Two Server Actions on one page have two different action ids**, and posting to
  the wrong one returns **303 and does nothing**. When driving a form by hand,
  pull the id out of the specific `<form>` you mean, not the first one on the page.
- **Scope test clicks to the form under test.** `form button[type="submit"]` picks
  the first form in the document. On `/owner/staff` that is a "Deactivate" form,
  so a photo-upload test quietly deactivated a staff member and still reported
  success. Use `form:has(input[name="..."]) button[type="submit"]`.
- **Screenshots are worth taking, and `chromium` works.** Playwright's WebKit
  build mismatched its package for two sessions, which is why several features
  shipped "structurally verified" only. `npx playwright install chromium` fixed
  it. Two real defects — a full-width button and the corrupted Arabic above —
  were invisible to HTTP assertions and obvious in a screenshot.
- **Never drive `/auth/login` before it hydrates.** Its inputs are controlled React
  state and carry `id` only — **no `name`** — so `page.fill()` on a
  not-yet-hydrated page leaves the DOM looking correct while `signIn` posts empty
  strings. The symptom is *Invalid email or password* with `CredentialsSignin` in
  the server log, which reads exactly like a wrong password. On 2026-08-25 this
  cost a diagnosis: the hash was bcrypt-compared directly and a raw `curl` to
  `/api/auth/callback/credentials` returned a session token, proving the app was
  fine. **`goto(…, {waitUntil:"networkidle"})`, pause, then `type()` with a delay.**
- **An auth check that never signed in passes for the wrong reason.** In the same
  run, "no MISSING_MESSAGE", "Arabic RTL" and "salon owner refused
  `/admin/revenue`" all went green while the browser sat on a login page. **Assert
  the precondition** — that the login actually landed on `/owner` — or a
  refused-access check proves only that a logged-out user is logged out.
- **Screenshot after the page settles, not after `domcontentloaded`.** Leaflet
  tiles load async and salon covers are `loading="lazy"`, so an early screenshot
  shows a black map panel and empty cards that look exactly like a broken build.
  Confirm with `naturalWidth` and a `requestfailed` listener before believing it:
  on 2026-08-25 all 12 tiles and all 3 covers had in fact loaded.
- **Filtering Leaflet tiles** must target `.leaflet-tile-pane`, not
  `.leaflet-tile`: Leaflet's stylesheet sets `.leaflet-tile { filter: inherit }`
  and loads after the app's CSS, silently overriding a rule on the tile itself.
- **`tar` overwrites and adds, but never deletes.** Re-syncing to
  `C:\temp\salon-hub-live` after a change that *removed* files leaves the removed
  files alive there and rebuilds them into the bundle. Delete the affected
  directories in the build copy first — this bit during the 2026-08-25 HudHud
  revert, where a stale `provider.ts` and geo route would have survived.
- **`document.fonts.check()` reports an unused weight as unloaded.** Browsers
  fetch faces lazily, so checking `700 16px X` when the page only renders `800`
  returns false while the font is working perfectly. Check the weight actually
  in use, and confirm with a width measurement against the fallback family —
  identical widths are what a silently-failed webfont looks like.
- **Never assert a WebGL map painted by reading its canvas back.** MapLibre (used
  briefly on 2026-08-25) creates its context without `preserveDrawingBuffer`, so
  `readPixels` outside a render frame returns solid black no matter what is on
  screen. Assert on tile **responses** instead, and treat `net::ERR_ABORTED` as
  success — panning cancels in-flight tiles, so aborted tiles mean it is working.
- **`page.mouse.click()` does not scroll the target into view; `locator.click()`
  does.** Clicking at a `boundingBox()` coordinate for an element below the fold
  clicks whatever is at those viewport coordinates instead, silently. Use
  `locator.click({ position })` for anything that needs a point inside an element.

## Picking up

**State at 2026-09-08 (end of session).**

✅ **The tree is committed and pushed.** Fourteen days of work that had been
sitting uncommitted on top of `4bed42f` — the Fade rename, the book-ly rename,
the two-face wordmark, the shears logo and the 3D lockup, then the launch
hardening — went up as three commits on 2026-09-08. `master` and `origin/main`
are level again, and a fresh clone now reproduces the running site. The warning
that stood here for two weeks (that a stray `git checkout` would destroy the
lot) is finally gone.

**The public repo is `github.com/alqaabdq-crypto/book-ly`** as of 2026-09-08,
renamed at the owner's request after the decision was declined once on
2026-08-25. GitHub redirects the old path, so an existing clone keeps fetching
and pushing without being touched — but a redirect is a courtesy, not a
guarantee, and anything written down (CI config, a bookmark, a README badge)
should be moved to the new URL rather than left to rely on it.

**The npm package and both folders followed on the same day**, and the repo was
recased to `Book-ly` when the brand was. The project lives at
`C:\Users\Admin\OneDrive\Desktop\claude\book-ly` and its production build copy at
`C:\temp\book-ly-live` — folder case left alone deliberately: on Windows it is
invisible, and a path change is what broke the Prisma client the last time.

⚠️ **Two things cannot follow the capital B.** **npm forbids uppercase in package
names**, so `package.json` stays `book-ly` and always will. And the **Postgres
database, its role, and the seeded `@salonhub.sa` logins** still carry the
original name entirely — changing those needs a re-seed that destroys the 42
settled payments every revenue figure here rests on. Leave it until there is real
data worth keeping.

The M1–M5 core is functionally complete; on top of it sit the 2026-07-27 UI
session, the 2026-08-04 maps work, photos, customer service and admin revenue
(M8–M10), and the 2026-08-25/26 and 2026-09-05 brand work (M12, M13).

Docker Postgres is up and migrated — **11 migrations**, the newest adding
`SiteReview.authorId` and the `RateLimit` table (2026-09-08, purely additive:
the 42 settled payments survived it). Beyond the base seed (3 salons, **with
coordinates**) it holds **demo revenue data** (`scripts/seed-sample-revenue.ts` —
42 settled payments, SAR 1,549 platform commission), **demo reviews**
(`scripts/seed-sample-reviews.ts`, 9 across the three salons), **9 placeholder
images**, **2 support tickets**, **two** `SiteReview` rows (the original test one
plus a real submission from "maj" on 2026-09-05), three
`reviewer.*@salonhub.sa` accounts, and a couple of leftover test accounts — so it
is **well past the pristine seed**. Both demo seeders are idempotent,
marker-tagged and safe to re-run or delete.

⚠️ **The seeded logins still use `@salonhub.sa` addresses** (`admin@salonhub.sa` /
`admin1234`, `owner.rose@salonhub.sa` / `owner1234`). Renaming them means
re-seeding, which destroys the payment data every revenue figure rests on. The
admin's *display name* is now "book-ly Admin" in both the seed and the live row —
the live row hand-edited each time, because the seed's `upsert` carries
`update: {}` and will not touch a row that already exists. The addresses were left
alone on purpose.

A Cloudflare quick tunnel serves the production build from `C:\temp\salon-hub-live`
(last live 2026-09-08:
`happiness-award-arthritis-restructuring.trycloudflare.com`);
**its hostname rotates on every relaunch**, so treat any pinned URL as ephemeral.

**Check what is actually down before rebuilding anything — the answer differs every
time.** On 2026-08-07 the Postgres container, the `:3111` server and even the
`cloudflared` process were all still up after three days and only the tunnel
*hostname* had expired, so the whole restart was one command. On 2026-08-10, two
days later, **the Docker daemon itself was down** and everything with it, so the
full chain had to come back: Docker Desktop → `docker compose up -d` → re-sync →
build → `next start` → tunnel (~5 minutes). On 2026-08-25, **15 days** idle, every
process was down again *but no rebuild was needed*: `HEAD` had not moved off
`4bed42f`, so the existing `.next` and `node_modules` in `C:\temp\salon-hub-live`
were still valid and the whole restart took under two minutes. A live `cloudflared`
process is **not** evidence of a working tunnel; curl the hostname. On 2026-09-05,
10 days later, every process was down again and again no rebuild was needed.
Rebuild only when app code has moved — but ⚠️ **`git diff --name-only
<last-built-commit> HEAD` no longer settles that**, because the running build was
made from *uncommitted* work: both commits predate everything the site shows, so
that diff stays empty whatever you edit. While the tree is dirty, compare the
modified app files against `C:\temp\salon-hub-live` with `md5sum` — that is what
settled 2026-09-05. Doc-only changes do not count either way. **Time idle predicts
nothing; what is down and whether the build copy still matches the tree are
separate questions.** Full commands under "Deployment".

⚠️ **`C:\temp\salon-hub-live` is not a clean tree.** ~460 MB of the 2026-08-07 tar
accident survived the robocopy purge — `OneDrive/`, `Saved Games/`, `Recent/`,
`Videos/` and other home-directory folders sit beside `src/`. Inert, ignored by the
build, and safe to delete; just do not mistake them for project files.

**Screenshot verification works, and every session since has earned its keep.**
`npx playwright install chromium` resolved the WebKit/package mismatch on
2026-08-04. Since then screenshots have caught a full-width button, corrupted
Arabic copy, and — on 2026-08-25/26 — three of *my own test bugs* that each
accused the app of a defect it did not have. **When a check disagrees with a
screenshot, suspect the check first.**

The whole product works end to end locally: a salon owner can sign up, get
approved, list services and staff, **pin themselves on a map**, and take a booking
a customer made on a phone — possibly having found them through "near me" — then
confirm it and be paid for it. It has **never been deployed to a host**.

✅ **GitHub is current again.** It was fourteen days behind; as of 2026-09-08
`origin/main` carries everything the tunnel serves. ⚠️ **What a clone still does
not carry is the data**: the demo revenue, reviews, photos and support tickets
live only in this laptop's Postgres, so a fresh clone builds the site but starts
from the base seed.

**Two things have never been exercised for real, and each needs an account the
project owner holds.** (A third, HudHud Maps, was built and reverted on
2026-08-25 — see the reverted entry near the top of this file.)

- **Moyasar.** Get test keys, set `MOYASAR_SECRET_KEY` and
  `MOYASAR_WEBHOOK_SECRET`, point a webhook at `/api/payments/moyasar/webhook`,
  run one booking through. Everything downstream of that call is verified; the
  call itself is not.
- **A real host.** See "Deployment" — blocked on `vercel login` and a Neon
  connection string, nothing else.

**The README password leak is closed** (2026-08-07). The public README no longer
prints `admin1234` / `owner1234`; it tells you to choose `SEED_ADMIN_PASSWORD` and
`SEED_OWNER_PASSWORD` instead, and notes the defaults live in `prisma/seed.ts` for
localhost only. Open since the repo went public on 2026-07-27.

**The sun-glow has now been seen, repeatedly.** It appears in every landing
screenshot taken since 2026-08-25 and reads correctly — the "never
screenshot-verified" caveat carried from 2026-07-27 is closed. It has still never
been deliberately *tuned*, but it is no longer an unknown.

Suggested order:

0. ~~Commit the working tree.~~ **Done 2026-09-08.** The open decision that went
   with it stands: whether to rename the GitHub repo and npm package to match the
   product, offered on 2026-08-25 and declined for now.
1. ~~Reviews a customer can write.~~ **Done 2026-09-08.** What is left of it is
   data, not code: every rating on the site is still seeded until real customers
   use the form.

   **The five launch blockers that remain are all yours to unblock, not the
   code's** — see the 2026-09-05 audit entry for the full ten:
   deployment (needs `vercel login` and a Neon string), one real Moyasar payment
   (needs test keys), **payouts** (needs a commercial decision — who settles, on
   what cycle, under which SAMA arrangement — before `Payout` can be written to
   by anything), **VAT/ZATCA and the legal pages** (needs real numbers and an
   accountant), and **notifications** (needs an email or SMS provider chosen).
2. **Deploy to Vercel + Neon.** A tunnel to a laptop is not a deployment. The prep
   is done; blocked on `vercel login` and a Neon connection string. Watch for
   `btree_gist` in the M3 migration — the likely first surprise on managed
   Postgres — and note the new `@@index([status, lat, lng])` needs no extension.
3. **One real Moyasar test payment.** Everything about payments is speculation
   until that round-trips, and it is far easier to point a gateway webhook at a
   stable public URL than at a tunnel that changes hostname every run — which is
   why this follows the deploy rather than preceding it.
4. **Salon-level opening hours**, which both the detail page and the booking engine
   still approximate from staff shifts.
5. Split the auth config so the proxy stops bundling Prisma.
6. Pagination on browse, before the catalog grows past a screenful. The proximity
   path is already capped at 200; the unfiltered path is still unbounded.
7. **Bilingual `city`.** Now visible rather than theoretical: the Arabic browse
   page prints "Riyadh" in Latin script beside fully Arabic salon copy.

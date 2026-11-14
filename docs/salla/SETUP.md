# Turno on the Salla App Store: setup

Branch `feature/salla-app`. Lets salons that sell on Salla install Turno, link
their Salla store to their Turno salon, show an "احجز موعدك" button on their
storefront, and import their Salla service products.

## How it works

1. **Install (Salla → us).** Salla's "Easy mode" OAuth is the only mode allowed
   for published apps ([docs](https://docs.salla.dev/authorization.md)): Salla
   exchanges the code and posts the tokens to our webhook as
   `app.store.authorize`. We store them AES-256-GCM encrypted in `SallaStore`.
   Nothing is linked yet.
2. **Link (merchant, inside Salla).** The merchant opens Turno from their Salla
   dashboard. Salla renders our app page `/{locale}/salla/app` in an iframe with
   a short-lived token. We introspect it with Salla
   ([docs](https://docs.salla.dev/embedded-sdk/endpoint-tokent-introspect.md)),
   which proves the visitor is signed in to that store, and mint a 30-minute
   signed ticket.
3. **Confirm (owner, on Turno).** "Link my Turno salon" opens a new tab,
   `/api/salla/link?ticket=…`, which parks the ticket in an httpOnly cookie and
   sends them to `/{locale}/owner/salla`. Once they are signed in as the salon
   owner, they press "Link store". The server action re-verifies the ticket.
   Both proofs are required, and an email match is never used.
4. **Storefront button.** The App Snippet (`docs/salla/app-snippet.js`) asks
   `/api/salla/booking-link?store=<id>` for the booking page and shows the
   button only when the store is linked to an **approved** salon.
5. **Import services.** On the owner's Salla page, it copies Salla products of
   type `service` / `booking` into the salon as **hidden** services (Salla has
   no duration, so 30 min is the default). Re-running skips anything already
   imported.
6. **Uninstall.** `app.uninstalled` wipes the tokens and the link.

Refresh tokens are single-use on Salla, and reusing one revokes the install. So
`accessTokenFor` refreshes under a `SELECT … FOR UPDATE` row lock.

## What you do (once)

1. Create an account at **https://portal.salla.partners** and create a **Public
   app**.
2. In the app settings:
   - **OAuth mode:** Easy mode.
   - **Scopes:** store info (read) and products (read). `offline_access` is
     needed for refresh tokens.
   - **Webhook URL:** `https://<your-domain>/api/salla/webhook`
   - **Webhook security:** Signature (the default). Copy the webhook secret.
   - **App page / embedded URL:** `https://<your-domain>/ar/salla/app`
   - **App Snippet:** paste `docs/salla/app-snippet.js`, after replacing
     `TURNO_ORIGIN` with your domain.
3. In **Vercel → book-ly (project name unchanged) → Settings → Environment Variables**, add these.
   Never paste them into a chat.

   | Name | Value |
   |---|---|
   | `SALLA_CLIENT_ID` | Client ID from the Partners portal |
   | `SALLA_CLIENT_SECRET` | Client secret from the Partners portal |
   | `SALLA_WEBHOOK_SECRET` | Webhook secret from the Partners portal |
   | `SALLA_APP_ID` | The app's numeric id (used as `s-source` for introspection) |
   | `SALLA_TOKEN_KEY` | 32 random bytes, base64. Generate it once and never change it, or the stored tokens become unreadable |

4. Apply the migration to Neon: `npx prisma migrate deploy` (from PowerShell,
   with `.env.neon` loaded).
5. Test on a **Salla demo store** from the Partners portal: install, open the app
   page, link, import, and check the storefront button. Only then submit the app
   for Salla's review.

## Confirmed on the demo store (2026-11-14)

Install, app page, link, import and the storefront button all worked end to end
on a Salla demo store (merchant 1425032842), which settled these:

- **Embedded-page token parameter:** `?token=`, read with the Embedded SDK's
  `embedded.auth.getToken()`. The dashboard keeps its loading overlay up until
  the page calls `embedded.ready()`.
- **Introspection:** `POST https://api.salla.dev/exchange-authority/v1/introspect`
  (no `/admin/v2`) with header `S-Source: <app id>`; the answer carries
  `data.merchant_id`.
- **Store id in the snippet:** `salla.config.get("store.id")` works.
- **Framing origins:** `salla.sa`, `*.salla.sa` and `*.salla.partners` were
  enough for the dashboard to frame the app page.
- **Event times:** `created_at` is Saudi time (UTC+3) with no zone.
- **Service products:** an On-Demand Service product comes through the API as a
  bookable type and imports.

## Still not verified

- **Refresh-request fields.** The token endpoint is documented, but the refresh
  body isn't rendered in the docs. We send the standard OAuth fields
  (`grant_type=refresh_token`, `refresh_token`, `client_id`, `client_secret`).
  The demo store's access token expires 2026-11-22; the first refresh, a day
  before that, is the test. If the import shows "Salla did not answer"
  after that date, this is the place to look.

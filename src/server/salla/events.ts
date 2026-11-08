import { prisma } from "@/server/db/prisma";
import { encryptToken } from "@/server/salla/crypto";
import { expiryFrom, fetchStoreInfo } from "@/server/salla/client";

/**
 * Salla app lifecycle events (docs.salla.dev/partner-apis/app-events):
 *
 *   { "event": "app.store.authorize", "merchant": 1234509876,
 *     "created_at": "2022-12-31 12:31:25",
 *     "data": { "access_token", "refresh_token", "expires", "scope", "token_type" } }
 *
 * `app.installed` and `app.uninstalled` carry app metadata in `data`. Every
 * handler is idempotent and ignores events older than the last one applied:
 * Salla retries an undelivered event three times about five minutes apart, so
 * a retried authorize can arrive after the uninstall that followed it.
 */

export type SallaEvent = {
  event?: string;
  merchant?: number | string;
  created_at?: string;
  data?: Record<string, unknown>;
};

export type EventOutcome = "applied" | "stale" | "ignored";

/**
 * "2022-12-31 12:31:25" carries no zone. It is Saudi time: the first live
 * install's created_at was 3 hours ahead of the UTC expiry Salla sent with it.
 */
export function eventTime(createdAt: string | undefined): Date {
  if (!createdAt) return new Date();
  const d = new Date(/[TZ+]/.test(createdAt) ? createdAt : `${createdAt.replace(" ", "T")}+03:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function handleSallaEvent(body: SallaEvent): Promise<EventOutcome> {
  const merchantId = body.merchant === undefined || body.merchant === null ? "" : String(body.merchant);
  if (!merchantId || !body.event) return "ignored";

  const at = eventTime(body.created_at);
  const existing = await prisma.sallaStore.findUnique({ where: { merchantId } });
  if (existing?.lastEventAt && at < existing.lastEventAt) return "stale";

  switch (body.event) {
    case "app.store.authorize": {
      const d = body.data ?? {};
      const access = typeof d.access_token === "string" ? d.access_token : null;
      if (!access) return "ignored";
      const refresh = typeof d.refresh_token === "string" ? d.refresh_token : null;

      const fields = {
        accessTokenEnc: encryptToken(access),
        refreshTokenEnc: refresh ? encryptToken(refresh) : null,
        tokenExpiresAt: expiryFrom(d.expires),
        scope: typeof d.scope === "string" ? d.scope : null,
        uninstalledAt: null,
        lastEventAt: at,
      };

      const store = await prisma.sallaStore.upsert({
        where: { merchantId },
        create: { merchantId, installedAt: at, ...fields },
        update: { ...fields, installedAt: existing?.installedAt ?? at },
      });

      // Best effort: a name to show the owner at link time. The tokens are
      // already saved, so a failure here costs nothing but the label.
      try {
        const info = await fetchStoreInfo(store.id);
        await prisma.sallaStore.update({ where: { id: store.id }, data: info });
      } catch {
        /* the store page fetches it again when linking */
      }
      return "applied";
    }

    case "app.installed": {
      await prisma.sallaStore.upsert({
        where: { merchantId },
        create: { merchantId, installedAt: at, lastEventAt: at },
        update: { installedAt: at, uninstalledAt: null, lastEventAt: at },
      });
      return "applied";
    }

    case "app.uninstalled": {
      if (!existing) return "ignored";
      // Tokens die with the install, and so does the link: a reinstall must be
      // linked again by someone who can prove they hold both accounts.
      await prisma.sallaStore.update({
        where: { merchantId },
        data: {
          accessTokenEnc: null,
          refreshTokenEnc: null,
          tokenExpiresAt: null,
          salonId: null,
          linkedAt: null,
          uninstalledAt: at,
          lastEventAt: at,
        },
      });
      return "applied";
    }

    default:
      // app.updated is followed by a fresh app.store.authorize; settings,
      // trials and subscriptions mean nothing to Book-ly yet.
      return "ignored";
  }
}

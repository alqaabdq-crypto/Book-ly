"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { prisma } from "@/server/db/prisma";
import { requireOwnedSalon } from "@/server/salon/owner";
import { verifyLinkTicket } from "@/server/salla/crypto";
import { SALLA_LINK_COOKIE } from "@/server/salla/link";
import { fetchServiceProducts, fetchStoreInfo } from "@/server/salla/client";

const localeSchema = z.enum(routing.locales);

/** Imported services start hidden: Salla products carry no duration, so the
 *  owner checks the 30-minute default (and the English name) before customers
 *  can book them. */
const IMPORT_DURATION_MINUTES = 30;

async function guard(locale: (typeof routing.locales)[number]) {
  const owned = await requireOwnedSalon();
  if (!owned.ok) {
    return redirect({ href: owned.reason === "auth" ? "/auth/login" : "/owner", locale });
  }
  return owned;
}

function done(locale: (typeof routing.locales)[number], query: string): never {
  revalidatePath(`/${locale}/owner/salla`);
  return redirect({ href: `/owner/salla?${query}`, locale });
}

/**
 * Binds the Salla store named by the ticket cookie to the signed-in owner's
 * salon. Two proofs meet here: the ticket (minted only after Salla vouched for
 * the merchant on the embedded page) and the owner session. Neither alone can
 * link, and an email match is never used.
 */
export async function linkSallaStore(formData: FormData) {
  const locale = localeSchema.parse(formData.get("locale"));
  const owned = await guard(locale);

  const jar = await cookies();
  const merchantId = verifyLinkTicket(jar.get(SALLA_LINK_COOKIE)?.value);
  if (!merchantId) return done(locale, "error=ticket");

  const store = await prisma.sallaStore.findUnique({ where: { merchantId } });
  if (!store || store.uninstalledAt || !store.accessTokenEnc) return done(locale, "error=not-installed");
  if (store.salonId && store.salonId !== owned.salonId) return done(locale, "error=taken");

  const other = await prisma.sallaStore.findUnique({ where: { salonId: owned.salonId } });
  if (other && other.id !== store.id) return done(locale, "error=salon-has-store");

  let info: { name: string | null; domain: string | null } = { name: store.name, domain: store.domain };
  try {
    info = await fetchStoreInfo(store.id);
  } catch {
    /* keep what the webhook stored */
  }

  await prisma.sallaStore.update({
    where: { id: store.id },
    data: { salonId: owned.salonId, linkedAt: new Date(), ...info },
  });
  jar.delete(SALLA_LINK_COOKIE);
  return done(locale, "saved=linked");
}

/** Unlinks the owner's store. The app stays installed on Salla; the storefront
 *  button disappears because the booking-link endpoint stops answering. */
export async function unlinkSallaStore(formData: FormData) {
  const locale = localeSchema.parse(formData.get("locale"));
  const owned = await guard(locale);

  await prisma.sallaStore.updateMany({
    where: { salonId: owned.salonId },
    data: { salonId: null, linkedAt: null },
  });
  return done(locale, "saved=unlinked");
}

/**
 * Copies the linked store's service and booking products into the salon as
 * hidden services under the chosen category. Re-running skips products already
 * imported (unique on salon + Salla product id), so it never overwrites prices
 * or names the owner has since edited.
 */
export async function importSallaServices(formData: FormData) {
  const locale = localeSchema.parse(formData.get("locale"));
  const owned = await guard(locale);

  const categoryId = z.string().min(1).safeParse(formData.get("categoryId"));
  if (!categoryId.success) return done(locale, "error=category");
  const category = await prisma.category.findUnique({ where: { id: categoryId.data }, select: { id: true } });
  if (!category) return done(locale, "error=category");

  const store = await prisma.sallaStore.findUnique({ where: { salonId: owned.salonId } });
  if (!store || store.uninstalledAt) return done(locale, "error=not-linked");

  let products;
  try {
    products = await fetchServiceProducts(store.id);
  } catch {
    return done(locale, "error=salla");
  }

  const already = new Set(
    (
      await prisma.service.findMany({
        where: { salonId: owned.salonId, sallaProductId: { not: null } },
        select: { sallaProductId: true },
      })
    ).map((s) => s.sallaProductId),
  );
  const fresh = products.filter((p) => !already.has(p.id));

  if (fresh.length > 0) {
    await prisma.service.createMany({
      data: fresh.map((p) => ({
        salonId: owned.salonId,
        categoryId: category.id,
        nameAr: p.name.slice(0, 120),
        nameEn: p.name.slice(0, 120),
        durationMinutes: IMPORT_DURATION_MINUTES,
        price: p.price.toFixed(2),
        isActive: false,
        sallaProductId: p.id,
      })),
      skipDuplicates: true,
    });
  }

  return done(locale, `saved=imported&count=${fresh.length}&skipped=${products.length - fresh.length}`);
}

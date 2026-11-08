import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localized } from "@/i18n/content";
import { NeedsSalon } from "@/components/needs-salon";
import { auth } from "@/server/auth/config";
import { prisma } from "@/server/db/prisma";
import { getOwnedSalon } from "@/server/salon/owner";
import { verifyLinkTicket } from "@/server/salla/crypto";
import { SALLA_LINK_COOKIE } from "@/server/salla/link";
import { importSallaServices, linkSallaStore, unlinkSallaStore } from "@/server/salla/actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; error?: string; count?: string; skipped?: string }>;
};

const ERRORS = ["ticket", "not-installed", "taken", "salon-has-store", "category", "not-linked", "salla"] as const;

const button = "rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background";
const quiet = "rounded-full border border-gray-300 px-5 py-2.5 text-sm dark:border-gray-700";

export default async function OwnerSallaPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { saved, error, count, skipped } = await searchParams;

  const session = (await auth())!;
  const t = await getTranslations("Salla");

  const salon = await getOwnedSalon(session.user.id);
  if (!salon) return <NeedsSalon />;

  const [linked, categories] = await Promise.all([
    prisma.sallaStore.findUnique({ where: { salonId: salon.id } }),
    prisma.category.findMany({ orderBy: { slug: "asc" } }),
  ]);

  // A ticket parked by /api/salla/link, waiting for this owner to confirm.
  const pendingId = verifyLinkTicket((await cookies()).get(SALLA_LINK_COOKIE)?.value);
  const pending =
    pendingId && pendingId !== linked?.merchantId
      ? await prisma.sallaStore.findUnique({ where: { merchantId: pendingId } })
      : null;

  const errorKey = ERRORS.find((e) => e === error);

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t("intro")}</p>
      </div>

      {saved && (
        <p role="status" className="rounded-lg border border-green-500 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-100">
          {saved === "imported"
            ? t("savedImported", { count: Number(count ?? 0), skipped: Number(skipped ?? 0) })
            : saved === "unlinked"
              ? t("savedUnlinked")
              : t("savedLinked")}
        </p>
      )}
      {errorKey && (
        <p role="alert" className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          {t(`error.${errorKey}`)}
        </p>
      )}

      {pending && !pending.uninstalledAt && (
        <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <h3 className="font-semibold">{t("confirmTitle")}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {t("confirmBody", {
              store: pending.name ?? `#${pending.merchantId}`,
              salon: localized(salon, "name", locale),
            })}
          </p>
          <form action={linkSallaStore} className="mt-4">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={button}>{t("confirmLink")}</button>
          </form>
        </section>
      )}

      {linked ? (
        <>
          <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{linked.name ?? `#${linked.merchantId}`}</p>
                {linked.domain && (
                  <a href={linked.domain} target="_blank" rel="noopener noreferrer" className="text-sm underline" dir="ltr">
                    {linked.domain}
                  </a>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${linked.uninstalledAt ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100" : "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100"}`}>
                {linked.uninstalledAt ? t("statusUninstalled") : t("statusLinked")}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {salon.status === "APPROVED" ? t("buttonLive") : t("buttonWaiting")}
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
            <h3 className="font-semibold">{t("importTitle")}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t("importBody")}</p>
            <form action={importSallaServices} className="mt-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="locale" value={locale} />
              <label className="flex flex-col gap-1 text-sm">
                {t("importCategory")}
                <select name="categoryId" required className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-transparent">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{localized(c, "name", locale)}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className={button}>{t("importRun")}</button>
            </form>
          </section>

          <form action={unlinkSallaStore}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={quiet}>{t("unlink")}</button>
          </form>
        </>
      ) : (
        !pending && (
          <section className="rounded-xl border border-dashed border-gray-300 p-5 dark:border-gray-700">
            <h3 className="font-semibold">{t("howTitle")}</h3>
            <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm text-gray-700 dark:text-gray-200">
              <li>{t("how1")}</li>
              <li>{t("how2")}</li>
              <li>{t("how3")}</li>
            </ol>
          </section>
        )
      )}
    </div>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/server/db/prisma";
import { introspectEmbeddedToken } from "@/server/salla/client";
import { signLinkTicket } from "@/server/salla/crypto";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; session_token?: string }>;
};

/**
 * The app page Salla renders inside the merchant's Salla dashboard (set as the
 * app's page URL in the Salla Partners portal: https://<domain>/ar/salla/app).
 *
 * Salla appends a short-lived token to the URL; introspecting it with Salla is
 * what proves the visitor is signed in to that store. Only then do we mint a
 * link ticket. The link button opens a new top-level tab, because Book-ly's
 * sign-in cookie may be blocked inside Salla's iframe. Framing is allowed for
 * Salla's domains only, in next.config.ts.
 */
export default async function SallaEmbeddedPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Salla");

  const { token, session_token } = await searchParams;
  const merchantId = await introspectEmbeddedToken(token ?? session_token ?? "").catch(() => null);

  const store = merchantId
    ? await prisma.sallaStore.findUnique({
        where: { merchantId },
        select: { uninstalledAt: true, accessTokenEnc: true, salon: { select: { nameAr: true, nameEn: true } } },
      })
    : null;

  const installed = store && !store.uninstalledAt && store.accessTokenEnc;
  const ticket = installed && merchantId ? signLinkTicket(merchantId) : null;
  const linkedName = store?.salon ? (locale === "ar" ? store.salon.nameAr : store.salon.nameEn) : null;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 p-6">
      <h1 className="text-2xl font-bold">{t("embedTitle")}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{t("embedIntro")}</p>

      {!merchantId ? (
        <p role="alert" className="mt-6 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          {t("embedOpenFromSalla")}
        </p>
      ) : !installed ? (
        <p role="status" className="mt-6 rounded-lg border border-gray-300 px-4 py-3 text-sm dark:border-gray-700">
          {t("embedWaiting")}
        </p>
      ) : (
        <div className="mt-6 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          {linkedName ? (
            <p className="text-sm">{t("embedLinkedTo", { salon: linkedName })}</p>
          ) : (
            <ol className="list-decimal space-y-1 ps-5 text-sm text-gray-700 dark:text-gray-200">
              <li>{t("embedStep1")}</li>
              <li>{t("embedStep2")}</li>
              <li>{t("embedStep3")}</li>
            </ol>
          )}
          <a
            href={`/api/salla/link?ticket=${encodeURIComponent(ticket!)}&locale=${locale}`}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-block rounded-full bg-foreground px-5 py-2.5 font-medium text-background"
          >
            {linkedName ? t("embedManage") : t("embedLink")}
          </a>
        </div>
      )}
    </main>
  );
}

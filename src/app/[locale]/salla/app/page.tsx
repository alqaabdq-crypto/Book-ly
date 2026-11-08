import { getTranslations, setRequestLocale } from "next-intl/server";
import { SallaEmbedded } from "@/components/salla-embedded";

type Props = { params: Promise<{ locale: string }> };

/**
 * The app page Salla renders inside the merchant's Salla dashboard (the app's
 * Embedded Page in the Salla Partners portal: https://<domain>/ar/salla/app).
 *
 * The shell is static; the live part is a client component, because the Salla
 * dashboard keeps a loading overlay over this iframe until the page calls
 * `embedded.ready()` from Salla's Embedded SDK. Introspecting the `?token=` with
 * Salla (server side, /api/salla/embedded-session) is what proves the visitor
 * is signed in to that store; only then is a link ticket issued. Framing is
 * allowed for Salla's domains only, in next.config.ts.
 */
export default async function SallaEmbeddedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Salla");

  return (
    <main className="mx-auto w-full max-w-xl flex-1 p-6">
      <h1 className="text-2xl font-bold">{t("embedTitle")}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{t("embedIntro")}</p>
      <SallaEmbedded
        locale={locale}
        copy={{
          openFromSalla: t("embedOpenFromSalla"),
          waiting: t("embedWaiting"),
          checking: t("embedChecking"),
          step1: t("embedStep1"),
          step2: t("embedStep2"),
          step3: t("embedStep3"),
          link: t("embedLink"),
          manage: t("embedManage"),
          linkedTo: t.raw("embedLinkedTo") as string,
        }}
      />
    </main>
  );
}

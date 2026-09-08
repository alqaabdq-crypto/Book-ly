import type { Metadata } from "next";
import {
  Crimson_Pro,
  Geist,
  Geist_Mono,
  Kanit,
  Noto_Sans_Arabic,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
});

/**
 * The display half of the wordmark — "-ly" — and nothing else.
 *
 * Kanit Black Italic, replacing Anton, which held the slot for a few hours and
 * was judged too plain. The lesson of that swap is in the *axis*, not the face:
 * Anton contrasted with the serif only by width, and condensed-next-to-normal is
 * a quiet difference. Slanting the display half sets it against an upright serif
 * on the axis a reader notices first, so the same weight now reads as motion.
 * Sheet: `C:\temp\ly-compare2.html`, fifteen faces across four directions
 * (sporty italic, techno, street, contemporary display) at the two real sizes.
 * Saira Condensed 900 Italic was the runner-up — sharper and narrower, more
 * racing-team than salon.
 *
 * Italic is loaded, not synthesised. Asking for the upright and letting the
 * browser slant it would shear the curves of a 900-weight face into mud; the
 * `style: ["italic"]` here is what makes `font-style: italic` on the span pick
 * up a drawn italic instead. One weight, one style, because that is all the logo
 * uses.
 */
const hype = Kanit({
  variable: "--font-hype",
  subsets: ["latin"],
  weight: ["900"],
  style: ["italic"],
});

/**
 * The serif half of the wordmark — "book" — and nothing else.
 *
 * The face asked for is **Minion Pro**, which is an Adobe retail family: it is
 * not on Google Fonts, and its licence does not cover self-hosting it as a
 * webfont. Serving the real thing needs an Adobe Fonts web project on the
 * owner's Creative Cloud account. So the stack asks for `"Minion Pro"` first —
 * anyone who has it installed sees the genuine face — and falls to **Crimson
 * Pro** for everyone else, which is drawn from the same oldstyle model Minion
 * is (moderate contrast, humanist axis, compact lowercase) and is the closest
 * face on Google Fonts. Chosen by rendering nine serifs at the two real logo
 * sizes against the display "-ly"; the sheet is `C:\temp\minion-compare.html`.
 *
 * Semibold, not regular: at 400 the serif reads lighter than the display half
 * beside it and the wordmark looks like two unrelated words. 600 holds its own
 * against Anton. Only 600 is requested, because only 600 is used.
 */
const serifmark = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "book-ly",
  description: "Book trusted salons across Saudi Arabia.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`dark ${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} ${hype.variable} ${serifmark.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

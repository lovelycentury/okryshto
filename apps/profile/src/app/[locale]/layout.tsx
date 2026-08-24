import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { AnimatedBackground } from "@okryshto/react";
import LocaleFab from "@/components/LocaleFab/LocaleFab";
import ThemeFab from "@/components/ThemeFab/ThemeFab";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { routing } from "@/i18n/routing";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";
import "@okryshto/design-system/styles/index.scss";
import "@okryshto/react/style.css";
import "@/styles/globals.scss";

// The design system asks for Inter + JetBrains Mono by name; next/font self-hosts
// both, so there is no render-blocking request to fonts.googleapis.com at runtime.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--profile-font-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--profile-font-mono",
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <div className="app-shell">
            <a className="app-shell__skip-link" href="#main">
              {t("skipToContent")}
            </a>
            <AnimatedBackground
              className="app-shell__background"
              preset="aurora"
              quality="medium"
              scrim
            />
            <main className="app-shell__main" id="main">
              {children}
            </main>
            <SiteFooter />
            <ThemeFab />
            <LocaleFab />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

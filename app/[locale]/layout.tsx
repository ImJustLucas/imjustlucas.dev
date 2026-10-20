import "@/styles/globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";

import { fontVariables } from "@/app/fonts";
import { PresenceProvider } from "@/components/presence/PresenceProvider";
import { SoundProvider } from "@/components/sound/SoundProvider";
import { MobileMenuProvider } from "@/contexts/menu-mobile.context";
import { routing } from "@/i18n/routing";
import { getProfile } from "@/lib/content/server";
import { PALETTE_SCRIPT } from "@/lib/palette";

import ClientLayout from "./ClientLayout";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/** Every page is statically generated for each Locale; other values 404. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL("https://imjustlucas.dev"),
    title: t("siteName"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const profile = await getProfile();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* The visitor's palette, before the first paint */}
        <script dangerouslySetInnerHTML={{ __html: PALETTE_SCRIPT }} />
      </head>
      <body className={`${fontVariables} antialiased`}>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Analytics />
            <SpeedInsights />
            <SoundProvider>
              <PresenceProvider discordUserId={profile.discordUserId}>
                <MobileMenuProvider>
                  <ClientLayout profile={profile}>{children}</ClientLayout>
                </MobileMenuProvider>
              </PresenceProvider>
            </SoundProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import "@/styles/globals.css";

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";

import { geistMono, geistSans } from "@/app/fonts";
import { MobileMenuProvider } from "@/contexts/menu-mobile.context";
import { routing } from "@/i18n/routing";

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
  const t = await getTranslations({ locale, namespace: "Layout" });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Analytics />
            <SpeedInsights />
            <h1 className="absolute top-96 opacity-0">ImJustLucas</h1>
            <div className="fixed bottom-5 right-5 z-10 hover:cursor-pointer">
              <Image
                src="/images/chibi-avatar-64x64.png"
                alt={t("avatarAlt")}
                width={32}
                height={32}
              />
            </div>
            <MobileMenuProvider>
              <ClientLayout>{children}</ClientLayout>
            </MobileMenuProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

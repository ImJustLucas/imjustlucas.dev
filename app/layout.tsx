import "@/styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import { ThemeProvider } from "next-themes";

import { MobileMenuProvider } from "@/contexts/menu-mobile.context";

import ClientLayout from "./ClientLayout";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Analytics } from "@vercel/analytics/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ImJustLucas",
  description:
    "I'm a software developer based in the heart of Paris, France, with a focus on crafting high-quality websites and applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <h1 className="absolute top-96 opacity-0">ImJustLucas</h1>
          <div className="fixed bottom-5 right-5 z-10 hover:cursor-pointer">
            <Image
              src="/images/chibi-avatar-64x64.png"
              alt="ImJustLucas head avatar"
              width={32}
              height={32}
            />
          </div>
          <MobileMenuProvider>
            <ClientLayout>{children}</ClientLayout>
          </MobileMenuProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

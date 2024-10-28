import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

import { Analytics } from "@vercel/analytics/react";

import { MobileMenuProvider } from "@/contexts/menu-mobile.context";
import ClientLayout from "./ClientLayout";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <MobileMenuProvider>
          <ClientLayout>{children}</ClientLayout>
        </MobileMenuProvider>
      </body>
    </html>
  );
}

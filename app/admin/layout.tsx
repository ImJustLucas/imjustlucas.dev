import "@/styles/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";

import { SignInScreen } from "@/app/admin/admin-screens";
import { currentOwnerAccess } from "@/lib/admin/session";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Admin · ImJustLucas",
  robots: { index: false, follow: false },
};

/**
 * Root layout of the Admin: French, outside Locale routing, never indexed and
 * absent from the menu. It is the Admin's gate: only the signed-in Owner gets
 * past it. Admin pages and actions re-check the Owner themselves too.
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await currentOwnerAccess();
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-dvh bg-background p-6">
            {access.kind === "owner" ? (
              children
            ) : (
              <SignInScreen access={access} />
            )}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

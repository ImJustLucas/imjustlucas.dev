import "@/styles/globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { AdminNoticeProvider } from "@/app/admin/admin-form";
import { SignInScreen } from "@/app/admin/admin-screens";
import { fontVariables } from "@/app/fonts";
import { currentOwnerAccess } from "@/lib/admin/session";
import { PALETTE_SCRIPT } from "@/lib/palette";

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
      <head>
        {/* The Owner's palette, before the first paint */}
        <script dangerouslySetInnerHTML={{ __html: PALETTE_SCRIPT }} />
      </head>
      <body className={`${fontVariables} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-dvh bg-background p-6">
            {access.kind === "owner" ? (
              <AdminNoticeProvider>{children}</AdminNoticeProvider>
            ) : (
              <SignInScreen access={access} />
            )}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

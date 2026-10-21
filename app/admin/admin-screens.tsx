import { Github, House, RotateCw } from "lucide-react";

import { SignOutButton } from "@/app/admin/admin-shell";
import { ChibiSprite } from "@/components/chibi/ChibiSprite";
import {
  Bold,
  TypographyData,
  TypographyHeadline,
  TypographyP,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import type { OwnerAccess } from "@/lib/admin/owner-access";
import type { ChibiPose } from "@/lib/chibi";

/** A chibi pose on its ground stage disc, as on the site's banners. */
const Stage: React.FC<{ pose: ChibiPose; className: string }> = ({
  pose,
  className,
}) => (
  <div className={`relative shrink-0 ${className}`}>
    <span
      aria-hidden
      className="absolute inset-x-[6%] bottom-[4%] top-[14%] rounded-full bg-ground"
    />
    <ChibiSprite
      pose={pose}
      alt=""
      sizes="160px"
      priority
      className="size-full"
    />
  </div>
);

/** What anyone but the signed-in Owner sees at the Admin path. */
export const SignInScreen: React.FC<{
  access: Exclude<OwnerAccess, { kind: "owner" }>;
}> = ({ access }) => (
  <div className="sparkle-frame flex min-h-dvh p-3">
    <main className="flex flex-1 items-center justify-center rounded-xl bg-ground p-4">
      <section className="tray flex w-full max-w-[30rem] flex-col items-center rounded-lg border-2 border-seam bg-raised px-5 pb-7 pt-5 text-center sm:px-10 sm:pb-9">
        <Stage
          pose={access.kind === "refused" ? "sleeping" : "coding"}
          className="size-36 sm:size-40"
        />
        {access.kind === "refused" ? (
          <>
            <TypographyHeadline className="mt-4">
              Accès refusé
            </TypographyHeadline>
            <TypographyP className="text-pretty font-medium text-ink-muted [&:not(:first-child)]:mt-3">
              Le compte GitHub <Bold className="text-ink">@{access.login}</Bold>{" "}
              n&apos;a pas accès à l&apos;Admin. Déconnecte-toi pour changer de
              compte.
            </TypographyP>
            <SignOutButton className="mt-7 w-full sm:w-auto" />
          </>
        ) : (
          <>
            <TypographyHeadline className="mt-4">Admin</TypographyHeadline>
            <TypographyP className="text-pretty font-medium text-ink-muted [&:not(:first-child)]:mt-3">
              Connecte-toi avec ton compte GitHub pour modifier le contenu du
              site.
            </TypographyP>
            <Button
              asChild
              variant="play"
              size="lg"
              className="mt-7 w-full sm:w-auto"
            >
              {/* A full-page navigation: the sign-in Route Handler redirects to
                  GitHub, which client-side routing cannot follow. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/admin/auth/sign-in">
                <Github aria-hidden />
                Se connecter avec GitHub
              </a>
            </Button>
          </>
        )}
        {/* A full-page navigation into the Locale routes */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-md text-label text-ink-muted underline decoration-seam decoration-2 underline-offset-4 hover:text-ink [&_svg]:size-4"
        >
          <House aria-hidden />
          Retour au site
        </a>
      </section>
    </main>
  </div>
);

/**
 * What an editor shows the Owner when the content branch can't be read, e.g.
 * before the content exists on it.
 */
export const ContentUnavailableScreen: React.FC<{
  reason: string;
  branch: string;
}> = ({ reason, branch }) => (
  <div className="mx-auto flex min-h-full max-w-[56rem] items-center justify-center py-10">
    <section className="tray flex w-full max-w-[36rem] flex-col items-center rounded-lg border-2 border-seam bg-raised px-5 pb-7 pt-5 text-center sm:px-10 sm:pb-9">
      <Stage pose="sleeping" className="size-32 sm:size-36" />
      <TypographyHeadline className="mt-4">
        Contenu indisponible
      </TypographyHeadline>
      <TypographyP className="text-pretty font-medium text-ink-muted [&:not(:first-child)]:mt-3">
        Impossible de lire le contenu sur la branche{" "}
        <TypographyData className="rounded-sm bg-ground px-1.5 py-0.5 text-ink">
          {branch}
        </TypographyData>
        .
      </TypographyP>
      <TypographyData
        as="p"
        className="mt-4 w-full break-words rounded-md border-2 border-busy-ink/60 bg-ground px-4 py-3 text-left text-ink"
      >
        {reason}
      </TypographyData>
      <TypographyP className="text-pretty text-label text-ink-muted [&:not(:first-child)]:mt-4">
        Si le contenu n&apos;existe pas encore sur cette branche, règle{" "}
        <TypographyData className="text-ink">CONTENT_BRANCH</TypographyData> sur
        une branche qui le contient, puis recharge la page.
      </TypographyP>
      <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild variant="outline">
          {/* Reloads the editor: a plain navigation to itself */}
          <a href="">
            <RotateCw aria-hidden />
            Recharger
          </a>
        </Button>
        <SignOutButton />
      </div>
    </section>
  </div>
);

/**
 * What every Admin action returns to the Admin's forms. Plain data, no Effect
 * (ADR-0002), so client components can import it.
 */
export type AdminActionResult =
  /** Published: one commit on `main`, live after the redeploy. */
  | { readonly kind: "saved"; readonly revision: string }
  /**
   * Nothing committed: some fields are invalid. Keys are field paths in the
   * action's input (`name`, `name.fr`, `techs.1`), values French messages.
   */
  | {
      readonly kind: "invalid";
      readonly fieldErrors: Readonly<Record<string, string>>;
    }
  /** Nothing committed: the change would break the content (explained). */
  | { readonly kind: "refused"; readonly reason: string }
  /** Nothing committed: `main` moved since the Admin read it; reload. */
  | { readonly kind: "conflict" }
  /** Nothing committed: whoever called is not the signed-in Owner. */
  | { readonly kind: "not-owner" }
  /** Nothing committed: GitHub or the content could not be read or written. */
  | { readonly kind: "failed"; readonly reason: string };

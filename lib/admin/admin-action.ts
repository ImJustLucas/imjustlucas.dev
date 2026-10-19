import { Context, Data, Effect, Layer, Schema, SchemaIssue } from "effect";

import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  type AdminIdentitySource,
  type Owner,
  ownerAccess,
} from "@/lib/admin/owner-access";
import { loadContent } from "@/lib/content/catalog";
import type {
  ContentChange,
  ContentRepository,
  Revision,
} from "@/lib/content/repository";
import { Content, DOCUMENT_PATHS } from "@/lib/content/schema";

/**
 * The shape every Admin action follows: check the Owner, read the content,
 * apply the edit, validate the result with the content schemas, then publish
 * the changed documents (and any uploaded files) as one commit on top of the
 * revision the Admin read.
 * Each step that stops the save returns its `AdminActionResult`.
 */

/** Whoever called is not the signed-in Owner. */
export class NotOwner extends Data.TaggedError("NotOwner") {}

/**
 * The Admin's access to content: the signed-in Owner's content repository,
 * opened with his GitHub token, or `NotOwner` for anyone else.
 */
export class AdminAccess extends Context.Service<
  AdminAccess,
  {
    readonly repository: Effect.Effect<ContentRepository["Service"], NotOwner>;
  }
>()("admin/AdminAccess") {
  /**
   * Production passes the session and the GitHub repository; tests pass a
   * fake signed-in identity and an in-memory repository.
   */
  static readonly layer = (deps: {
    readonly identities: AdminIdentitySource;
    readonly ownerGithubId: string | undefined;
    readonly repositoryFor: (owner: Owner) => ContentRepository["Service"];
  }) =>
    Layer.succeed(AdminAccess, {
      repository: Effect.flatMap(
        Effect.promise(() => ownerAccess(deps.identities, deps.ownerGithubId)),
        (access) =>
          access.kind === "owner"
            ? Effect.sync(() => deps.repositoryFor(access.owner))
            : Effect.fail(new NotOwner()),
      ),
    });
}

/** Every content document, in its JSON shape. */
export type ContentDocuments = typeof Content.Encoded;

/** What an action makes of the current content. */
export type ContentEdit =
  | { readonly kind: "refused"; readonly reason: string }
  | {
      readonly kind: "edited";
      /** The commit message. */
      readonly message: string;
      /** Every document after the edit. */
      readonly documents: ContentDocuments;
      /**
       * The entry the action's input became (document and index): issues found
       * inside it are reported as field errors of the input.
       */
      readonly entry?: readonly [keyof ContentDocuments, number];
      /** Files committed with the documents, e.g. an uploaded image. */
      readonly assets?: ReadonlyArray<ContentChange>;
      /**
       * Errors in input the content schemas do not see (e.g. an upload):
       * reported with the schema's field errors, and nothing is committed.
       */
      readonly fieldErrors?: Readonly<Record<string, string>>;
    };

/**
 * Runs an Admin action: `edit` turns the content read at the current head
 * into the content to publish; the save is based on `revision`, the one the
 * Owner's form was opened at, so it is a conflict if `main` moved since.
 */
export const saveContent = (
  revision: Revision,
  edit: (content: Content) => ContentEdit,
): Effect.Effect<AdminActionResult, never, AdminAccess> =>
  Effect.gen(function* () {
    const repository = yield* (yield* AdminAccess).repository;
    const content = yield* loadContent(repository);

    const outcome = edit(content);
    if (outcome.kind === "refused") return outcome;

    const validated = yield* Schema.decodeUnknownEffect(Content)(
      outcome.documents,
      { errors: "all" },
    ).pipe(
      Effect.map((next) => ({ next })),
      Effect.catchTag("SchemaError", (error) =>
        Effect.succeed({ rejected: rejection(error, outcome.entry) }),
      ),
    );
    const fieldErrors = outcome.fieldErrors ?? {};
    if ("rejected" in validated)
      return validated.rejected.kind === "invalid"
        ? ({
            kind: "invalid",
            fieldErrors: { ...fieldErrors, ...validated.rejected.fieldErrors },
          } as const)
        : validated.rejected;
    if (Object.keys(fieldErrors).length > 0)
      return { kind: "invalid", fieldErrors } as const;

    const changes = [
      ...changedDocuments(content, validated.next),
      ...(outcome.assets ?? []),
    ];
    if (changes.length === 0) return { kind: "saved", revision } as const;

    const next = yield* repository.commit({
      revision,
      message: outcome.message,
      changes,
    });
    return { kind: "saved", revision: next } as const;
  }).pipe(
    Effect.catchTags({
      NotOwner: () => Effect.succeed({ kind: "not-owner" } as const),
      ContentConflict: () => Effect.succeed({ kind: "conflict" } as const),
    }),
    Effect.catch((error) =>
      Effect.succeed({ kind: "failed", reason: error.message } as const),
    ),
  );

/** The documents whose JSON differs, ready to commit. */
const changedDocuments = (before: Content, after: Content) =>
  (Object.keys(DOCUMENT_PATHS) as Array<keyof Content>).flatMap((kind) => {
    const text = toJson(after[kind]);
    return text === toJson(before[kind])
      ? []
      : [{ path: DOCUMENT_PATHS[kind], content: text }];
  });

const toJson = (document: unknown) => `${JSON.stringify(document, null, 2)}\n`;

const formatter = SchemaIssue.makeFormatterStandardSchemaV1();

/**
 * Issues inside the edited entry become field errors keyed by their path in
 * the input; any other issue (e.g. a reference left dangling elsewhere)
 * refuses the save, explained.
 */
const rejection = (
  error: Schema.SchemaError,
  entry: readonly [string, number] | undefined,
): AdminActionResult => {
  const fieldErrors: Record<string, string> = {};
  const elsewhere: Array<string> = [];
  for (const issue of formatter(error.issue).issues) {
    const path = (issue.path ?? []).map((segment) =>
      typeof segment === "object" ? segment.key : segment,
    );
    const message = inFrench(issue.message);
    if (entry && path[0] === entry[0] && path[1] === entry[1]) {
      const field = path.slice(2).map(String).join(".");
      fieldErrors[field] ??= message;
    } else {
      elsewhere.push(message);
    }
  }
  if (Object.keys(fieldErrors).length > 0)
    return { kind: "invalid", fieldErrors };
  return {
    kind: "refused",
    reason: `Cette modification rendrait le contenu invalide : ${elsewhere.join(" ; ")}`,
  };
};

/** The Admin is in French; the content schemas speak English. */
const FRENCH: ReadonlyArray<
  readonly [RegExp, (match: RegExpMatchArray) => string]
> = [
  [/^Missing translation$/, () => "Traduction manquante"],
  [/^Missing key$/, () => "Champ obligatoire"],
  [/^Expected a value with a length of at least 1$/, () => "Champ obligatoire"],
  [/^Expected a #rrggbb colour$/, () => "Couleur attendue au format #rrggbb"],
  [
    /^Expected a lowercase kebab-case identifier$/,
    () => "Identifiant attendu en minuscules, mots séparés par des tirets",
  ],
  [/^Unknown Tech identifier: (.*)$/, (m) => `Tech inconnu : ${m[1]}`],
  [
    /^Tech identifier defined more than once: (.*)$/,
    (m) => `Un Tech utilise déjà cet identifiant : ${m[1]}`,
  ],
  [
    /^Expected a year \(YYYY\) or a year-month \(YYYY-MM\)$/,
    () => "Année (AAAA) ou mois (AAAA-MM) attendu",
  ],
  [
    /^Expected a year \(YYYY\), a year-month \(YYYY-MM\) or ongoing$/,
    () => "Année (AAAA), mois (AAAA-MM) ou « en cours » attendu",
  ],
  [
    /^End must not precede start$/,
    () => "La fin ne peut pas précéder le début",
  ],
  [/^Expected an http\(s\) URL$/, () => "Adresse http(s) attendue"],
  [
    /^Expected https:\/\/github\.com\/<owner>\/<repository>$/,
    () => "Adresse attendue au format https://github.com/<compte>/<dépôt>",
  ],
];

const inFrench = (message: string) => {
  for (const [pattern, translate] of FRENCH) {
    const match = message.match(pattern);
    if (match) return translate(match);
  }
  return message;
};

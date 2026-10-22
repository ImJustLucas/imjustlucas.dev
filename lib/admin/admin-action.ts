import { Context, Data, Effect, Layer, Schema, SchemaIssue } from "effect";

import type { AdminActionResult } from "@/lib/admin/action-result";
import {
  type AdminIdentitySource,
  type Owner,
  ownerAccess,
} from "@/lib/admin/owner-access";
import type { UploadedImage } from "@/lib/admin/uploaded-image";
import { type CatalogError, loadContent } from "@/lib/content/catalog";
import { byStartMostRecentFirst, type Period } from "@/lib/content/period";
import type {
  ContentChange,
  ContentRepository,
  Revision,
} from "@/lib/content/repository";
import { Content, DOCUMENT_PATHS } from "@/lib/content/schema";

/**
 * The shape every Admin action follows: check the Owner, read the content at
 * the revision the editor was opened at, apply the edit (reading any upload
 * only then), validate the result with the content schemas, then publish the
 * changed documents (and any uploaded files) as one commit on top of that
 * revision. Each step that stops the save returns its `AdminActionResult`.
 * Also here: what every `lib/admin/<kind>.ts` shares (`Saved`,
 * `commitMessage`, `documents`, `gone`, `openEditor`).
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

/**
 * A file the Owner uploaded with a form, read only when called. Admin actions
 * read it after the Owner check, so nobody else can make the server load a
 * file into memory.
 */
export type Upload = () => Promise<Uint8Array>;

/** An upload could not be read from the request. */
export class UploadUnreadable extends Data.TaggedError("UploadUnreadable")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/** Reads an upload's bytes. */
export const readUpload = (
  upload: Upload,
): Effect.Effect<Uint8Array, UploadUnreadable> =>
  Effect.tryPromise({
    try: upload,
    catch: (cause) =>
      new UploadUnreadable({
        message: "Le fichier envoyé n'a pas pu être lu",
        cause,
      }),
  });

/**
 * The image path a save gives an entry: the one uploaded (named by `store`,
 * e.g. `projectImage`), committed alongside, or a field error on `field`;
 * else `current`, the one it had.
 */
export const imageUpload = (options: {
  readonly upload: Upload | undefined;
  readonly current: string | undefined;
  readonly field: string;
  readonly store: (bytes: Uint8Array) => UploadedImage;
}): Effect.Effect<
  {
    readonly image: string | undefined;
    readonly assets?: ReadonlyArray<ContentChange>;
    readonly fieldErrors?: Readonly<Record<string, string>>;
  },
  UploadUnreadable
> => {
  const { upload, current, field, store } = options;
  if (!upload) return Effect.succeed({ image: current });
  return Effect.map(readUpload(upload), (bytes) => {
    const uploaded = store(bytes);
    return uploaded.kind === "invalid"
      ? { image: current, fieldErrors: { [field]: uploaded.error } }
      : {
          image: uploaded.url,
          assets: [{ path: uploaded.path, content: bytes }],
        };
  });
};

/**
 * A list editor's entries in display order, the order of the public pages
 * (by Period, most recent first), each with `index`, its position in the
 * stored document, which the actions address it by.
 */
export const inPeriodOrder = <A extends { readonly period: Period }>(
  entries: ReadonlyArray<A>,
): ReadonlyArray<{ readonly index: number; readonly entry: A }> =>
  entries
    .map((entry, index) => ({ index, entry }))
    .sort((a, b) => byStartMostRecentFirst(a.entry.period, b.entry.period));

/** Every content document, in its JSON shape. */
export type ContentDocuments = typeof Content.Encoded;

/** An Admin action, ready to run with the Admin's access to content. */
export type AdminAction = Effect.Effect<AdminActionResult, never, AdminAccess>;

/** What every save's input carries: the revision its editor was opened at. */
export type Saved = { readonly revision: Revision };

/** Every Admin commit's message, e.g. `📝 Admin: add Tech 'Effect'`. */
export const commitMessage = (change: string) => `📝 Admin: ${change}`;

/** Every document, with those `change` replaces. */
export const documents = (
  content: Content,
  change: Partial<ContentDocuments>,
): ContentDocuments => ({ ...content, ...change });

/**
 * The refusal when the entry the editor showed no longer exists, e.g.
 * `gone("Cette Experience")`.
 */
export const gone = (entry: string) =>
  ({
    kind: "refused",
    reason: `${entry} n'existe plus. Recharge la page.`,
  }) as const;

/**
 * What an editor shows the Owner, read at `revision`; nothing to others; or,
 * when the content can't be read (e.g. a branch without it), why, in French.
 */
export type Editor<A> =
  | ({ readonly kind: "owner"; readonly revision: Revision } & A)
  | { readonly kind: "not-owner" }
  | { readonly kind: "unavailable"; readonly reason: string };

/**
 * Why the content could not be read or written, in French for the Owner.
 * Anything that isn't a content error keeps its own message.
 */
const describe = (error: { readonly message: string }): string => {
  if (!("_tag" in error)) return error.message;
  const content = error as CatalogError;
  switch (content._tag) {
    case "ContentNotFound":
      return `Le fichier ${content.path} est introuvable.`;
    case "ContentInvalid":
      return [
        "Le contenu est invalide :",
        ...content.issues.map(
          (issue) =>
            `${issue.path}${issue.at ? ` (${issue.at})` : ""} : ${issue.message}`,
        ),
      ].join(" ");
    case "ContentRepositoryError":
      return `GitHub n'a pas pu être lu : ${content.message}`;
    default:
      return error.message;
  }
};

/**
 * Opens an editor: reads the current revision, then the content at exactly
 * that revision, which `view` turns into what the editor shows. Saves are
 * based on that revision, so they rebuild nothing the editor did not show.
 */
export const openEditor = <A extends object>(
  view: (content: Content) => A,
): Effect.Effect<Editor<A>, never, AdminAccess> =>
  Effect.gen(function* () {
    const repository = yield* (yield* AdminAccess).repository;
    const revision = yield* repository.head;
    const content = yield* loadContent(repository, revision);
    const editor: Editor<A> = { kind: "owner", revision, ...view(content) };
    return editor;
  }).pipe(
    Effect.catchTag("NotOwner", () =>
      Effect.succeed<Editor<A>>({ kind: "not-owner" }),
    ),
    Effect.catch((error) =>
      Effect.succeed<Editor<A>>({
        kind: "unavailable",
        reason: describe(error),
      }),
    ),
  );

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
       * The entry the action's input became (document and index, or the whole
       * document, e.g. the Profile): issues found inside it are reported as
       * field errors of the input.
       */
      readonly entry?:
        | readonly [keyof ContentDocuments, number]
        | readonly [keyof ContentDocuments];
      /** Files committed with the documents, e.g. an uploaded image. */
      readonly assets?: ReadonlyArray<ContentChange>;
      /**
       * Errors in input the content schemas do not see (e.g. an upload):
       * reported with the schema's field errors, and nothing is committed.
       */
      readonly fieldErrors?: Readonly<Record<string, string>>;
    };

/**
 * Runs an Admin action: `edit` turns the content read at `revision`, the one
 * the Owner's form was opened at, into the content to publish. The save is
 * based on that same revision, so it is a conflict if `main` moved since,
 * and it never rebuilds documents from content newer (or staler) than what
 * the editor showed.
 */
export const saveContent = (
  revision: Revision,
  edit: (
    content: Content,
  ) => ContentEdit | Effect.Effect<ContentEdit, UploadUnreadable>,
): AdminAction =>
  Effect.gen(function* () {
    const repository = yield* (yield* AdminAccess).repository;
    const content = yield* loadContent(repository, revision);

    // An effectful edit reads an upload: only now, the Owner checked.
    const edited = edit(content);
    const outcome = Effect.isEffect(edited) ? yield* edited : edited;
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
      Effect.succeed({ kind: "failed", reason: describe(error) } as const),
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
  entry: readonly [string, number] | readonly [string] | undefined,
): AdminActionResult => {
  const fieldErrors: Record<string, string> = {};
  const elsewhere: Array<string> = [];
  for (const issue of formatter(error.issue).issues) {
    const path = (issue.path ?? []).map((segment) =>
      typeof segment === "object" ? segment.key : segment,
    );
    const message = inFrench(issue.message);
    if (entry?.every((segment, i) => path[i] === segment)) {
      const field = path.slice(entry.length).map(String).join(".");
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
    /^Expected a language code \(BCP 47\)$/,
    () => "Code de langue attendu, par exemple fr, en ou pt-BR",
  ],
  [
    /^Expected an http\(s\) URL$/,
    () => "Lien attendu, commençant par http:// ou https://",
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
  // The ContractType literals, listed by the schema.
  [
    /^Expected "entrepreneurship"( \| "[\w-]+")*$/,
    () => "Type de contrat inconnu",
  ],
  // The Rarity literals.
  [/^Expected "common"( \| "[\w-]+")*$/, () => "Rareté inconnue"],
  // The Hobby poses.
  [/^Expected "surf"( \| "[\w-]+")*$/, () => "Pose inconnue"],
  [
    /^Expected a whole number from 1$/,
    () => "Nombre entier attendu, à partir de 1",
  ],
  [
    /^Expected an emoji \(at most 8 characters\)$/,
    () => "Emoji attendu (8 caractères au maximum)",
  ],
  [
    /^Expected a year from 2000 to 2100$/,
    () => "Année attendue, de 2000 à 2100",
  ],
  [
    /^Expected a page of the site \(\/…\) or an http\(s\) URL$/,
    () =>
      "Page du site attendue (commençant par /) ou lien commençant par http:// ou https://",
  ],
  [
    /^Expected an image \(PNG, JPEG, WebP or AVIF\) in (\S+), or a WebP or PNG in (\S+)$/,
    (m) =>
      `Image attendue (PNG, JPEG, WebP ou AVIF) dans ${m[1]}, ou WebP ou PNG dans ${m[2]}`,
  ],
  [
    /^Expected https:\/\/github\.com\/<owner>\/<repository>$/,
    () => "Lien attendu au format https://github.com/<compte>/<dépôt>",
  ],
  [
    /^Expected a YouTube channel identifier \(UC…\)$/,
    () => "Identifiant de chaîne YouTube attendu (commençant par UC)",
  ],
  [
    /^Expected a Discord account identifier$/,
    () => "Identifiant de compte Discord attendu (17 à 20 chiffres)",
  ],
  [
    /^Expected an image \(PNG, JPEG, WebP or AVIF\) in (\S+)$/,
    (m) => `Image attendue (PNG, JPEG, WebP ou AVIF) dans ${m[1]}`,
  ],
  [/^Expected a PDF in (\S+)$/, (m) => `PDF attendu dans ${m[1]}`],
  [
    /^Expected a version \(e\.g\. 2\.4 or 2\.4\.1\)$/,
    () => "Version attendue, par exemple 2.4 ou 2.4.1",
  ],
  [
    /^Patch version used more than once: (.*)$/,
    (m) => `Un Patch porte déjà cette version : ${m[1]}`,
  ],
  [/^Expected a date \(YYYY-MM-DD\)$/, () => "Date attendue (AAAA-MM-JJ)"],
  [/^Expected at least one line$/, () => "Au moins une ligne"],
  // The Patch tags.
  [/^Expected "new"( \| "[\w-]+")*$/, () => "Étiquette inconnue"],
  // The Profile's YouTube link must be its channel's URL.
  [/^Expected (https:\/\/\S+)$/, (m) => `Lien attendu : ${m[1]}`],
];

const inFrench = (message: string) => {
  for (const [pattern, translate] of FRENCH) {
    const match = message.match(pattern);
    if (match) return translate(match);
  }
  return message;
};

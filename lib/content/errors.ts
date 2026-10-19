import { Data } from "effect";

/** No file exists at this path in the content repository. */
export class ContentNotFound extends Data.TaggedError("ContentNotFound")<{
  readonly path: string;
  readonly message: string;
}> {
  constructor(props: { readonly path: string }) {
    super({ ...props, message: `Content file not found: ${props.path}` });
  }
}

/** The content repository moved since the revision a write was based on. */
export class ContentConflict extends Data.TaggedError("ContentConflict")<{
  readonly revision: string;
  readonly head: string;
  readonly message: string;
}> {
  constructor(props: { readonly revision: string; readonly head: string }) {
    super({
      ...props,
      message: `Content changed since revision ${props.revision} (now at ${props.head})`,
    });
  }
}

/** The content repository could not be reached or refused the operation. */
export class ContentRepositoryError extends Data.TaggedError(
  "ContentRepositoryError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export type ContentIssue = {
  /** The content file the issue was found in. */
  readonly path: string;
  /** Where in the document, e.g. `[0].techs[1]`; empty for the whole file. */
  readonly at: string;
  readonly message: string;
};

/**
 * A content document is not valid JSON, does not match its schema, or breaks
 * a cross-document rule (e.g. an unknown Tech identifier). Fails the build.
 */
export class ContentInvalid extends Data.TaggedError("ContentInvalid")<{
  readonly issues: ReadonlyArray<ContentIssue>;
  readonly message: string;
}> {
  constructor(props: { readonly issues: ReadonlyArray<ContentIssue> }) {
    super({
      ...props,
      message: [
        "Invalid content:",
        ...props.issues.map(
          (issue) =>
            `  ${issue.path}${issue.at ? ` at ${issue.at}` : ""}: ${issue.message}`,
        ),
      ].join("\n"),
    });
  }
}

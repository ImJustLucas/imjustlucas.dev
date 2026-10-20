# Coding standards

Judgement calls a reviewer checks on every diff. Mechanical rules (import order, formatting, Effect in React code, raw text tags, a Route for every page) are enforced by `pnpm lint` and `pnpm test`, so they are not repeated here.

## One mechanism per job

- Reuse before adding. A new Admin editor copies the pattern in `docs/admin.md`: `saveContent` and `openEditor` from `lib/admin/admin-action.ts`, the form helpers of `app/admin/action-form.ts`, `FileField` and `lib/admin/upload.ts` for files, `PeriodField`/`readPeriod` for a Period. Flag a second helper, field component, upload check or error-message table doing what one of these already does.
- One type per domain concept. A Period, a Locale, a Resume or a Localized text is imported from where it is defined (`lib/content/period.ts`, `i18n/routing.ts`, `lib/content/schema.ts`, `lib/admin/action-result.ts`), never retyped as a local object or string union.
- External sources (GitHub, YouTube) go through `lib/content/external-source.ts`, so cold builds and revalidation behave the same way for all of them.

## Domain language

- Code names, test names, commit messages and Admin labels use the terms of `GLOSSARY.md` (Project, Experience, Tech, Tech category, Achievement, Hobby, Rarity, Video, Profile, Resume, Period, Locale, Owner, Admin) and avoid the words listed under _Avoid_. French Admin labels may say "CV".

## Docs stay true

- A change to behaviour that `docs/routing.md`, `docs/content.md`, `docs/admin.md` or `CLAUDE.md` describes updates that doc in the same change.
- A change that contradicts an ADR in `docs/adr/` says so and why, or is rejected.

## Every visible string has both Locales

- Public pages get every visible string from `messages/{en,fr}.json` and every descriptive content text from the catalog in the page's Locale; a page never mixes languages. Proper nouns and Video titles stay as they are.

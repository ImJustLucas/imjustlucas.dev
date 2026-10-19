# The Admin writes content to the repo, not to a database

Projects, Experiences, Techs, Tech categories and the Profile live as JSON files in `content/`, validated by a schema. The Admin saves by committing those files (and uploaded images or the Resume PDF in `public/`) straight to `main` through the GitHub API, using the Owner's own GitHub token, which triggers a redeploy. We chose this over a database or a hosted CMS because the site is edited a few times a month by a single Owner: a one-minute deploy delay costs nothing, while git keeps the history, keeps the public pages static, needs no storage to run or back up, and still lets the Owner edit the files by hand.

## Consequences

- A save is a publish: there is no draft or preview state.
- A save is refused if `main` moved since the Admin read the file, so it never overwrites a commit pushed from elsewhere.
- Stars and Videos are not content: they are fetched from GitHub and YouTube, never written by the Admin.

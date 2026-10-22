# imjustlucas.dev

Lucas's personal portfolio site: who he is, what he has built, how he works, and the videos he publishes, kept up to date by its Owner through a private Admin.

## Content

**Project**:
A piece of work showcased on the site, optionally backed by a public GitHub repository whose star count is shown alongside it. Each has its own page, addressed by its slug (`/what/<slug>`), set when the Project is created and never changed.
_Avoid_: Work, repo

**Project page**:
A Project's own page, its inspect screen: its screenshots, what it is, who Lucas was on it, its loadout and links, and, when the Owner wrote them, its context, what he built and its outcome. Pressed on the Projects page, it opens as a window over the inventory.
_Avoid_: Case study, project detail

**Experience**:
A position or step in Lucas's career, held over a period of time.
_Avoid_: TimelineEvent, timeline entry, job

**Rarity**:
What kind of thing a Project or Achievement is: common (a side project), rare (shipped work), epic (a founded product) or legendary (a national win). Set by the Owner, never a quality score.
_Avoid_: Tier, level, score

**Achievement**:
A distinction Lucas earned, such as a competition won, shown on the home page with its year, Rarity and art.
_Avoid_: Trophy, award, badge

**Hobby**:
Something Lucas does outside work, shown on the home page with the chibi avatar pose that depicts it.
_Avoid_: Interest, pastime

**Cabinet**:
One game of the Arcade, the page where Lucas's Hobbies become playable: playable, or standing on the shelf as "soon" until its game exists. Ollie (skate) is the first.
_Avoid_: Game card, level, minigame

**Leaderboard**:
A Cabinet's top 10: the best players, each once with their best score and the first name they chose. Scores come from runs the server replayed.
_Avoid_: Ranking, high scores, hall of fame

**Player**:
A visitor playing in the Arcade, known by an id made in their browser and, once they make a Leaderboard, a first name.
_Avoid_: User, gamer

**Period**:
The span of time a Project or Experience covers: a start and an end, each precise to the month or the year, where the end may be "ongoing".
_Avoid_: Date (for a span), duration

**Tech**:
A language, framework or tool, identified by its name and display colour, referenced by Projects.
_Avoid_: techBadge, technology, stack

**Loadout**:
Every Tech the Projects use, each with how many Projects use it and the year the first of them started, derived from the Projects rather than written by hand; it filters the Projects page.
_Avoid_: Stack, skills, Tech category

**Contribution**:
One thing GitHub counts on Lucas's account calendar (a commit, a pull request, an issue, a review), sourced from GitHub rather than written by hand.
_Avoid_: Commit (for any contribution), activity

**Level**:
Where Lucas stands as a player, earned from his Contributions: one Contribution is one XP, counted since his GitHub account opened, and each Level costs 100 XP more than the one before. Never a Rarity, never a rank.
_Avoid_: Rank, tier, grade

**Streak**:
The consecutive days, in Paris, on which Lucas made at least one Contribution, ending today; a today without one yet does not break it until the day ends.
_Avoid_: Combo, chain

**Video**:
A video published on Lucas's YouTube channel, sourced from the channel itself rather than written by hand.
_Avoid_: YouTubeVideo, clip

**Profile**:
Lucas's public identity: his social links, his Resume and his Discord account.
_Avoid_: Socials, links

**Resume**:
The downloadable PDF of Lucas's CV, one per Locale, each with the date it was last updated.
_Avoid_: CV

**Patch**:
One version of the site in its patch notes: a version (`<season>.<patch>`, an optional hotfix number after), a date, a title and lines tagged new, changed or fixed, in the Owner's voice, optionally linking the pull request that shipped it. The newest Patch's version is the site's current version.
_Avoid_: Release, changelog entry, update

**Season**:
The patches sharing a version's first number: Season 1 is the first portfolio, Season 2 the Player Profile.
_Avoid_: Major version, era

**Locale**:
One of the two languages the site is published in: English (the default) or French. Every descriptive text in the content exists in both.
_Avoid_: Language, lang

## Admin

**Owner**:
Lucas, the only person ever allowed into the Admin.
_Avoid_: User, admin (for the person)

**Admin**:
The private space where the Owner edits Projects, Experiences, Techs, Achievements, Hobbies, the Profile and the patch notes.
_Avoid_: Back-office, dashboard

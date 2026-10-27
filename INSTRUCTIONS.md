# INSTRUCTIONS — Adding a project to the portfolio

You are an AI agent working inside one of Jatin's project folders. Follow this playbook to add (or update) **your** project's tile on the portfolio page:

- **Live site:** https://jatin-jain-123.github.io/portfolio/
- **Repo:** https://github.com/Jatin-Jain-123/portfolio (public)
- **Local clone (usually present):** `C:\Users\jatin\Downloads\projects\portfolio`

For background on how the site works and why (architecture, schema, trade-offs), see [`PLAN.md`](PLAN.md). Only needed if you are changing more than a project entry.

You only ever touch **two things**: one entry in `projects.json` and one logo file in `logos/`. Never edit `index.html`, `assets/app.js` or `assets/style.css` to add a project.

---

## 0. Ground rules

1. **One project = one entry**, identified by its `slug`. If an entry with your slug already exists, **update it in place**. Don't add a second one.
2. **Nothing confidential.** This repo and site are public. Each project has a **private source repo** (e.g. `pets`) and a **public showcase repo** that hosts its GitHub Pages site (e.g. `lemiki`). Never link to, name, or describe the private repo or its internals.
3. **Commit and push straight to `main`.** No PRs.
4. **Don't touch other projects' entries or logos.**
5. If a required value can't be found (see step 2), **ask the user** rather than guessing. Never invent URLs.
6. **Trademarks.** Every project is Jatin's trademark. The page automatically shows a superscript **™** after each project name. Set `"mark": "r"` (shows **®**) **only when the user explicitly says the mark is registered**. Never infer it, and never type ™, ®, © (or `(TM)`, `(R)`, `(C)`) into `title` or `description`; the validator rejects them.

---

## 1. Get an up-to-date copy of the repo

```bash
# If the local clone exists (default):
cd "C:/Users/jatin/Downloads/projects/portfolio"
git pull --rebase origin main

# Otherwise:
gh repo clone Jatin-Jain-123/portfolio
cd portfolio
```

## 2. Gather the information

| Field | Required | Where to find it / rules |
|---|---|---|
| `slug` | ✅ | Lowercase kebab-case, unique, stable forever. Use the **public** repo name, lowercased (e.g. `lemiki`). |
| `title` | ✅ | The product's display name, ≤ 40 chars (e.g. `Lemiki`). Plain name only, with **no ™/®/© symbols** (the page adds the mark). |
| `mark` | optional | Trademark symbol after the title. **Omit it** for the default **™**. Use `"r"` for **®** only when the user explicitly says the trademark is registered. The only allowed values are `"tm"` and `"r"`. |
| `pageUrl` | ✅ | The project's **public GitHub Pages URL**: `https://jatin-jain-123.github.io/<public-repo>/`. The logo links here. **Not** a repo URL, and never the private repo. Check that it loads (`curl -sI <url>` returns 200). If the project has no Pages site yet, stop and ask the user. |
| `description` | ✅ | 40–240 chars, one or two sentences. Say **what problem it solves and the value to the user**, not the tech stack. Plain text, no markdown. Good: *"A tiny cat that lives on your desktop and reacts to your builds, tests and typing, so coding feels a little less lonely."* Bad: *"An Electron app written in TypeScript using IPC."* |
| `logo` | recommended | Path `logos/<slug>.<ext>` (`.svg` preferred, else `.png`/`.webp`/`.jpg`), square, ≥ 128×128 for raster images, ≤ 300 KB. Take it from the project's own icon/branding assets (app icon, extension icon, favicon). If no logo exists, leave the field out; the page shows a coloured letter instead. |
| `platforms` | ✅ (may be `[]`) | Every public place where people can get or use the project. Each item is `{ "type": "<key>", "url": "https://..." }`. Allowed `type` keys are below. One entry per type. Only include **live, public** listings. |
| `tags` | recommended | 1–3 short Title Case tags (≤ 24 chars). **Reuse tags that already exist in `projects.json`** before making up new ones (see the suggested list below). |
| `addedOn` | ✅ | Today's date, `YYYY-MM-DD`. Keep the original date when updating an existing entry. |
| `order` | optional | A number for manual ordering (lower comes first). **Leave it out** unless the user asks; un-ordered tiles show newest `addedOn` first. |

### Allowed platform types

| `type` | Shown as | Example URL |
|---|---|---|
| `github-releases` | GitHub Releases | `https://github.com/Jatin-Jain-123/lemiki/releases` |
| `vscode-marketplace` | VS Code Marketplace | `https://marketplace.visualstudio.com/items?itemName=publisher.ext` |
| `npm` | npm | `https://www.npmjs.com/package/<name>` |
| `pypi` | PyPI | `https://pypi.org/project/<name>/` |
| `chrome-web-store` | Chrome Web Store | `https://chromewebstore.google.com/detail/<id>` |
| `microsoft-store` | Microsoft Store | `https://apps.microsoft.com/detail/<id>` |
| `play-store` | Google Play | `https://play.google.com/store/apps/details?id=<pkg>` |
| `app-store` | App Store | `https://apps.apple.com/app/<id>` |
| `telegram` | Telegram | `https://t.me/<bot_or_channel>` |
| `website` | Website | Any separate product site or live demo (not the GitHub Pages `pageUrl`) |
| `docker-hub` | Docker Hub | `https://hub.docker.com/r/<user>/<image>` |
| `homebrew` | Homebrew | `https://formulae.brew.sh/formula/<name>` |
| `winget` | winget | `https://winstall.app/apps/<Id>` or the winget-pkgs manifest URL |

`github-releases` must point to releases of the **public** repo only.

Need a platform that isn't listed? See **Adding a new platform type** at the end.

### Suggested tags (reuse these first)

`Desktop` · `CLI` · `Web App` · `Browser Extension` · `VS Code Extension` · `Mobile` · `Bot` · `Developer Tools` · `Productivity` · `AI` · `Automation` · `Fun`

## 3. Add the logo

Copy the logo into `logos/<slug>.<ext>`. Example:

```bash
cp "<path-to-your-project>/assets/icon.png" logos/lemiki.png
```

## 4. Add or update the entry in `projects.json`

The file has this shape. Insert your object into the `projects` array (anywhere; the page sorts it). Keep 2-space indentation and valid JSON (no trailing commas, no comments).

```json
{
  "projects": [
    {
      "slug": "lemiki",
      "title": "Lemiki",
      "logo": "logos/lemiki.png",
      "pageUrl": "https://jatin-jain-123.github.io/lemiki/",
      "description": "A tiny cat that lives on your desktop and reacts to your builds, tests and typing, so coding feels a little less lonely.",
      "tags": ["Desktop", "Developer Tools", "Fun"],
      "platforms": [
        { "type": "vscode-marketplace", "url": "https://marketplace.visualstudio.com/items?itemName=example.lemiki" },
        { "type": "github-releases", "url": "https://github.com/Jatin-Jain-123/lemiki/releases" }
      ],
      "addedOn": "2026-10-27"
    }
  ]
}
```

(The above is an **illustration**. Use your project's real values.) It has no `mark` field, so it renders as **Lemiki™**. Add `"mark": "r"` only when the user says the trademark is registered.

No other fields are allowed; the validator rejects unknown keys.

## 5. Validate

```bash
node scripts/validate.mjs
```

It must print `✓ projects.json is valid`. Fix every reported problem before you commit. The same check runs in GitHub Actions on every push.

Optional visual check: `python -m http.server 8000` (or `npx serve`) in the repo root, then open http://localhost:8000. Opening `index.html` directly as a file won't load the data.

## 6. Commit and push to `main`

```bash
git add projects.json logos/
git commit -m "portfolio: add <title>"      # or "portfolio: update <title>"
git push origin main
```

If the push is rejected because `main` moved on, run `git pull --rebase origin main`, re-run the validator, then push again. If `projects.json` conflicts, keep **both** sides' entries.

## 7. Verify it's live

GitHub Pages redeploys within about a minute. Then:

```bash
curl -s https://jatin-jain-123.github.io/portfolio/projects.json | grep '"slug": "<slug>"'
```

Report the live URL back to the user: https://jatin-jain-123.github.io/portfolio/

---

## Upgrading ™ to ® (registered trademark)

Only when the user explicitly says a project's trademark is now registered: add `"mark": "r"` to that entry (leave everything else unchanged), validate, then commit with `portfolio: mark <title> as registered (®)`. To revert, remove the field.

## Removing a project

Delete its object from `projects.json` and its file from `logos/`, validate, then commit with `portfolio: remove <title>`. Only do this when the user asks.

## Adding a new platform type

Only when a project is published somewhere that isn't in the table above:

1. Add a monochrome, square SVG (24×24 viewBox, single colour, no background) at `assets/platforms/<key>.svg`. Brand icons can usually be taken from [Simple Icons](https://simpleicons.org) (`https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/<name>.svg`). The page tints it automatically for light/dark mode.
2. Add `"<key>": { "label": "<Display Name>", "action": "<Get it on | Install from | ...>" }` to `assets/platforms.json`. The tooltip reads `"<action> <label>"`.
3. Add a row to the **Allowed platform types** table in this file.
4. Validate, commit (`portfolio: add <key> platform`), push.

## How the page works (for reference)

- `index.html` contains the header (name, tagline, socials) and an empty grid.
- `assets/app.js` fetches `projects.json` and `assets/platforms.json` and builds one tile per project: logo (links to `pageUrl`, tooltip *"Open project page for full details"*), title with a superscript ™/® (tooltip *"<Title> is a trademark of Jatin Jain"*), description, tags, and platform icons (each links to its URL, tooltip e.g. *"Get it on VS Code Marketplace"*).
- The footer shows `© <years> Jatin Jain. All rights reserved.` plus a trademark notice that mentions only the mark types in use.
- Tags power the filter bar above the grid. It appears automatically once at least two distinct tags exist. Clicking a chip (or a tag on a tile) shows only matching projects, and the URL becomes shareable (`/portfolio/#tag=CLI`).

# PLAN.md — Portfolio repo: single source of truth

> **Read this first** if you are an AI agent (or human) changing anything in this repo.
> - **Only adding/updating/removing a project entry?** Follow [`INSTRUCTIONS.md`](INSTRUCTIONS.md); it's the operational playbook. This file explains the *why* and *how* behind it.
> - **Changing the site itself** (layout, schema, platforms, tooling)? Read this whole file, then keep it, `INSTRUCTIONS.md`, and `scripts/validate.mjs` in sync (see [§12 Change checklist](#12-change-checklist)).

---

## 1. Statement of purpose

This repo has exactly **one job: publicly display Jatin Jain's portfolio of projects** as a single web page.

- **Owner:** Jatin Jain. GitHub: [`Jatin-Jain-123`](https://github.com/Jatin-Jain-123), LinkedIn: `linkedin.com/in/jatin-jain-123-`, Email: `jatin321jain@gmail.com`
- **Live site:** https://jatin-jain-123.github.io/portfolio/
- **Repo:** https://github.com/Jatin-Jain-123/portfolio (**public**)
- **Local clone:** `C:\Users\jatin\Downloads\projects\portfolio`
- **Tagline (header):** "Product-minded builder. I turn small, real problems into things people actually use."

**Ownership, copyright and trademarks:** every project shown is created by, and registered under the name of, Jatin Jain.
- **Copyright:** the site and this repo are © Jatin Jain, all rights reserved. There is no open-source license on purpose; "public" means visible, not licensed for reuse. The © symbol appears in the page footer (`© 2026 Jatin Jain. All rights reserved.`, which becomes a range like `2026–2027` automatically), the `<meta name="copyright">` tag, and the README footer.
- **Trademarks:** every project name is displayed with a superscript **™** by default. It becomes **®** only when the owner **explicitly** says that project's trademark is registered (then the entry gets `"mark": "r"`). Agents must never infer registration.

**Why it's a public repo:** GitHub Pages is free only for public repositories, so this repo is public by necessity. **Everything committed here is public.** Nothing confidential or proprietary may ever land in it.

**Who writes the content:** AI agents working in each project's own folder add that project's tile by following `INSTRUCTIONS.md`. The owner's per-project `CLAUDE.md` files point agents there. The owner chose **not** to reference it from the global `~/.claude/CLAUDE.md`; don't add it there.

### Non-goals

- Not a blog, résumé, or CMS. No per-project detail pages; detail lives on each project's own GitHub Pages site.
- No analytics, trackers, cookies, or third-party scripts.
- No build system, frameworks, or package dependencies.

---

## 2. The two-repo model per project (critical context)

Every project Jatin builds has **two repos**:

| | Private repo | Public showcase repo |
|---|---|---|
| Example | `pets` | `lemiki` |
| Contains | Confidential source code | Only a GitHub Pages site about the project; nothing proprietary |
| Visibility | Private | Public |

**Rules that follow:**

- A tile's **logo links to the public showcase repo's GitHub Pages site** (`pageUrl`, e.g. `https://jatin-jain-123.github.io/lemiki/`). It **never** links to a repo page, and **never** to anything private.
- The `slug` is the public repo's name, lowercased.
- Never mention a private repo's name, URL, or internals anywhere in this repo (entries, logos, commit messages).
- `github-releases` platform links must point at the **public** repo's releases.

---

## 3. Page specification

Top to bottom:

1. **Header:** name "Jatin Jain", tagline, round social icon buttons (GitHub, LinkedIn, Email via `mailto:`), each with a tooltip.
2. **Tag filter bar:** chips `All N`, then each tag with its count, sorted by count descending and then alphabetically. **Rendered only when ≥ 2 distinct tags exist.** Single-select: clicking the active chip (or `All`) clears the filter.
3. **Grid of tiles:** responsive auto-fill columns, min 300px (`min(300px, 100%)` so it never overflows phones).
4. **Empty state:** "Projects are on their way. Check back soon." when there are 0 projects. A load-failure message replaces it if the fetch fails.
5. **Footer:**
   - Motto: *"Build things you’d be proud to show."* Static text in `index.html`, slightly larger and italic in the body text colour so it reads as a sign-off.
   - Line 1: `© <years> Jatin Jain. All rights reserved.` Years = `START_YEAR` (2026, in `app.js`), or `2026–<current>` once the current year is later.
   - Line 2, the trademark notice, shown only when ≥ 1 project exists. It names only the mark types in use: *"Product names marked ™ are trademarks of Jatin Jain."*, *"…marked ® are registered trademarks…"*, or both combined (*"Product names marked ™ are trademarks, and those marked ® are registered trademarks, of Jatin Jain."*).

**Each tile contains:**

| Element | Behaviour |
|---|---|
| Logo (56×56) | `<a>` to `pageUrl`, new tab. Tooltip: **"Open project page for full details"**. If `logo` is missing or fails to load, a coloured letter is shown instead (first letter of title; hue derived from a hash of the slug). |
| Title | `<h2>` with the plain name followed by `<sup class="mark">™</sup>` (or `®` when `mark: "r"`). The mark has a tooltip *"<Title> is a trademark of Jatin Jain"* (or *"…registered trademark…"*) and is keyboard-focusable. |
| Description | Problem solved and value to the user, plain text |
| Tags | Small buttons; clicking one applies that filter |
| Platform icons | One 36×36 button per platform, each `<a>` to its URL in a new tab. Tooltip: `"<action> <label>"`, e.g. "Get it on VS Code Marketplace". Section hidden if `platforms` is empty. |

**Sort order:** ascending `order` first; entries without `order` come after, newest `addedOn` first.

**URL state:** the active filter is mirrored in the hash as `#tag=<Tag>` (via `history.replaceState`, so no history spam). Loading a URL with `#tag=X` applies the filter. An unknown tag falls back to "All".

**Theming:** light/dark follows `prefers-color-scheme` by default. A round sun/moon button at the top-right of the header switches theme; its tooltip and `aria-label` say what it will switch to ("Switch to dark mode"). The choice is saved in `localStorage` under `theme` (`"light"`/`"dark"`) and set as `data-theme` on `<html>` by a tiny inline script in `<head>`, so it applies before first paint (no flash). With no saved choice, the page keeps following the OS live.

---

## 4. Architecture

A **static site with client-side rendering from JSON**, served by classic GitHub Pages ("Deploy from a branch": `main`, `/`).

```
browser ──GET──> index.html ──loads──> assets/style.css, assets/app.js
                                       app.js ──fetch (parallel)──> projects.json
                                                                   assets/platforms.json
                                       app.js builds tiles from <template id="tile-template">
```

### File map

| Path | Purpose | Who edits |
|---|---|---|
| `index.html` | Shell: meta/OG tags, inline-SVG "JJ" favicon (data URI), inline pre-paint theme script, header, theme toggle, socials, filter container, grid, empty state, footer, `<template>` for a tile | Maintainers only |
| `assets/style.css` | All styling; design tokens as CSS custom properties on `:root`; dark overrides twice, identically: in `@media (prefers-color-scheme: dark)` on `:root:not([data-theme="light"])`, and on `:root[data-theme="dark"]` | Maintainers only |
| `assets/app.js` | Rendering, filtering, sorting, URL hash, icon masking, fallback logos. Vanilla ES2020 in an IIFE, no globals | Maintainers only |
| `projects.json` | **The data.** `{ "projects": [ ... ] }` | Project agents (via INSTRUCTIONS.md) |
| `logos/<slug>.<ext>` | Project logos | Project agents |
| `logos/.gitkeep` | Keeps the folder in git while it's empty | Leave it |
| `assets/platforms.json` | Platform registry: `key → { label, action }` | Maintainers / agents adding a platform type |
| `assets/platforms/<key>.svg` | Monochrome platform icons, one per registry key | Same |
| `assets/social/*.svg` | Header social icons (github, linkedin, email) | Maintainers |
| `assets/theme/*.svg` | Theme toggle icons (sun, moon), hand-drawn | Maintainers |
| `scripts/validate.mjs` | Data validator (Node ≥ 18, zero deps) | Maintainers |
| `.github/workflows/validate.yml` | Runs the validator on push to `main` and on PRs (Node 22) | Maintainers |
| `.nojekyll` | Disables Jekyll so files are served verbatim and quickly | Leave it |
| `.gitattributes` | `* text=auto eol=lf`; images marked binary. Keeps line endings consistent across Windows agents | Leave it |
| `INSTRUCTIONS.md` | Agent playbook for adding/updating/removing entries | Keep in sync with schema |
| `PLAN.md` | This file | Update on any technical change |
| `README.md` | Short human-facing intro and links | Rarely |

---

## 5. Data schema: `projects.json`

```jsonc
{
  "projects": [
    {
      "slug": "lemiki",                       // required. lowercase kebab-case ^[a-z0-9]+(-[a-z0-9]+)*$, unique, = public repo name
      "title": "Lemiki",                      // required. 1–40 chars, plain name: no ™ ® © or (TM)/(R)/(C)
      "mark": "r",                            // optional. "tm" | "r". Omit = ™ (default). "r" = ® only on the owner's explicit word
      "logo": "logos/lemiki.png",             // optional. under logos/, .svg|.png|.webp|.jpg|.jpeg, ≤ 300 KB, must exist
      "pageUrl": "https://jatin-jain-123.github.io/lemiki/", // required. https; public GitHub Pages site
      "description": "…",                     // required. 40–240 chars, plain text: problem and value; no ™ ® © symbols
      "tags": ["Desktop", "Fun"],             // optional. ≤ 3 strings, each 1–24 chars, Title Case by convention
      "platforms": [                          // required (may be []). no duplicate types
        { "type": "vscode-marketplace", "url": "https://…" } // type ∈ platforms.json keys; url https; no other keys
      ],
      "order": 1,                             // optional number; lower first. Agents omit unless the owner asks
      "addedOn": "2026-10-27"                 // required. YYYY-MM-DD; preserved on updates
    }
  ]
}
```

- **Unknown fields are rejected** (catches typos like `pageURL`). Adding a field means updating the validator's `ALLOWED` set, `app.js`, `INSTRUCTIONS.md`, and this section.
- Array position doesn't matter; the page sorts.
- JSON only: no comments, no trailing commas, 2-space indent.

### Platform registry: `assets/platforms.json`

`{ "<key>": { "label": "<Display>", "action": "<verb phrase>" } }`. The tooltip is `"${action} ${label}"`. The icon path is derived as `assets/platforms/<key>.svg` (convention, no mapping field).

Current keys (13): `github-releases`, `vscode-marketplace`, `npm`, `pypi`, `chrome-web-store`, `microsoft-store`, `play-store`, `app-store`, `telegram`, `website`, `docker-hub`, `homebrew`, `winget`.

`website` means a separate product site or live demo, not the `pageUrl`.

### Suggested tag vocabulary

`Desktop` · `CLI` · `Web App` · `Browser Extension` · `VS Code Extension` · `Mobile` · `Bot` · `Developer Tools` · `Productivity` · `AI` · `Automation` · `Fun`. Agents should reuse existing tags before inventing new ones, to keep the filter bar small.

---

## 6. Rendering details (`assets/app.js`)

- **Boot:** sets the footer year, applies masks to `[data-icon]` elements (socials), then `Promise.all` fetches both JSON files with `cache: "no-cache"`, so new entries show without stale caches.
- **Defensive filtering:** entries missing `slug` or `title` are skipped at runtime, even though the validator should already prevent them.
- **XSS safety:** all data goes in through `textContent` / attributes, **never `innerHTML`**. URLs pass through `safeUrl()`, which allows only `http:`/`https:`, so `javascript:` URLs are dropped. Unknown platform types are silently skipped.
- **Icons:** monochrome SVGs are rendered as CSS masks (`mask-image` set inline from JS) over `background-color: currentColor`, so one SVG adapts to light/dark/hover colours. The mask image is set **inline** (not via a CSS custom property) so relative URLs resolve against the document, not the stylesheet.
- **Trademark marks:** `MARKS = { tm: "™", r: "®" }` with nouns for tooltips. `markOf(p)` falls back to ™ for a missing or unknown value. The symbol is appended as a `<sup class="mark">` after the title text. It's styled with `position: relative; top: -0.7em` (not `vertical-align: super`) so the title's line height doesn't shift. The logo's `aria-label` includes the symbol. `renderTrademarkNotice()` builds the footer notice from the marks actually used. `OWNER` and `START_YEAR` constants live at the top of `app.js`.
- **Tooltips:** pure CSS from a `data-tip` attribute (`::after`). Elements at the start of a row get class `tip-start` (left-anchored) so tips don't clip off the left edge on small screens. Tooltips are hover/focus only; on touch devices `aria-label` carries the meaning.
- **Filtering:** toggles the `hidden` attribute on tiles. **CSS must keep `.tile[hidden] { display: none; }`**, because `.tile { display:flex }` would otherwise override `hidden`. (This was a real bug, caught in testing.)
- **Accessibility:** semantic landmarks, `aria-live` grid, `aria-pressed` on chips, `aria-label` on icon-only links, visible `:focus-visible` outlines, `prefers-reduced-motion` disables transitions, external links use `rel="noopener"`.

---

## 7. Validation and CI

`node scripts/validate.mjs` (exit 0 = valid; exit 1 lists **every** problem):

- Both JSON files parse; `projects` is an array.
- Every platform registry key has an SVG and string `label`/`action`.
- Per entry: allowed fields only; slug format and uniqueness; title length; **no ™/®/©/(TM)/(R)/(C) in title or description**; `mark` ∈ {`tm`, `r`}; description 40–240; `pageUrl` https; logo path/extension/existence/size; tags count and length; platform types known, unique, https, no extra keys; `order` numeric; `addedOn` a real `YYYY-MM-DD` date.

CI (`.github/workflows/validate.yml`) runs it on push to `main` and on PRs. **CI doesn't block deployment.** Pages deploys from `main` independently, so a bad push can go live. Agents must validate **before** pushing. This trade-off is accepted (see §9).

---

## 8. Deployment

- **Mechanism:** GitHub Pages, legacy/branch source: `main` branch, root `/`. Enabled via `gh api -X POST repos/Jatin-Jain-123/portfolio/pages -f source[branch]=main -f source[path]=/`.
- Every push to `main` triggers the built-in "pages build and deployment" workflow (~30–60 s).
- **URL:** a repo named `portfolio` serves at `https://jatin-jain-123.github.io/portfolio/`. (Only a repo named `Jatin-Jain-123.github.io` would serve at the bare root; not used.) All asset paths in the site are **relative**, so the `/portfolio/` subpath works without config.
- **Workflow policy:** commit and **push directly to `main`**, with no PRs (the owner's explicit choice).
- **Verify a deploy:** `gh run list -R Jatin-Jain-123/portfolio --limit 3`, then `curl -s https://jatin-jain-123.github.io/portfolio/projects.json`.
- **Local preview:** `python -m http.server 8000` (or `npx serve`) in the repo root, then http://localhost:8000. Opening `index.html` as a `file://` URL fails because `fetch` is blocked.

---

## 9. Technical decisions and trade-offs

| Decision | Chosen | Alternatives considered | Why |
|---|---|---|---|
| Stack | Plain HTML/CSS/vanilla JS | React/Vite, Astro, Jekyll, Hugo | Zero deps, zero build, nothing to break or upgrade. Any agent can edit it. Pages serves it as-is. |
| Content source | One `projects.json`, client-rendered | Hard-coded HTML per tile; one file per project + build step; Jekyll `_data` | Agents only touch data, never markup, so they can't break the layout. A single file needs no build or manifest. **Cost:** concurrent agents can produce git conflicts in the same file. Mitigated by `pull --rebase` and the "keep both entries" rule. **Cost:** no SEO for tile content (fine for a portfolio linked directly). |
| Platform registry | Separate `assets/platforms.json` + SVG per key | Hard-coded map in `app.js` | Shared by `app.js` and the validator with one source of truth. Adding a platform is data-only. |
| Icons | Local SVGs as CSS masks | Icon CDN / icon font; `<img>` tags | No third-party requests. Masks follow `currentColor` for theming. `<img>` can't be recoloured. |
| Icon sources | [Simple Icons](https://simpleicons.org) v13.21.0 (CC0) for most; **hand-drawn generic glyphs** for `vscode-marketplace`, `microsoft-store`, `winget`, `website`, email | Official brand assets | Simple Icons removed Microsoft brands (VS Code, Microsoft Store, Windows), so those are simple stand-ins (four squares with a tilted one; a shopping bag with a grid; a package box). LinkedIn's SVG came from Simple Icons v9.21.0. |
| Tooltips | CSS `data-tip` | Native `title`; JS tooltip library | Instant, styled, themeable, no JS. Native `title` is slow and unstyled. **Cost:** not shown on touch; `aria-label` covers accessibility. |
| Filter | Single-select tag chips, hidden below 2 tags, hash-synced | Multi-select; search box; always-visible bar | Simplest useful behaviour. Shareable links. No clutter while the portfolio is small. |
| Logo click target | Project's public GitHub Pages site | Repo URL | Two-repo model (§2): source repos are private. The Pages site is the public detail page. |
| Validation | Node script + CI, unknown fields rejected | JSON Schema + ajv; no validation | Zero deps (no `npm install`). Precise human-readable errors that agents can act on. Strictness catches typos. **Cost:** CI doesn't gate deploys. |
| Deploy | Branch-based Pages | Actions-based Pages deploy gated on validation | Simplest setup. **Cost:** an invalid push goes live until fixed. Upgrade path: switch Pages source to "GitHub Actions" and deploy only after `validate` passes. |
| Trademark symbol | Rendered by the page from a `mark` field (default ™) | Agents type ™/® into `title` | One consistent style and position. Upgrading to ® is a one-field change. The footer notice can be derived from it. Titles stay clean for `aria-label`s, tooltips and sorting. The validator forbids symbols in text so they can't double up. |
| Copyright years | `START_YEAR`–current, computed in JS | Hard-coded year | Never goes stale; no yearly commit needed. |
| Theme | `prefers-color-scheme` by default + manual toggle persisted in `localStorage` | Auto only (the original choice); toggle without persistence | Owner asked for a toggle (2026-10-29). Defaulting to the OS keeps first visits right; persisting avoids re-toggling on every visit. **Cost:** dark tokens are duplicated in two CSS blocks that must stay identical. |
| Fonts | System font stack | Google Fonts | No external requests, instant render. |
| Line endings | `.gitattributes` forcing LF | Default autocrlf | The owner is on Windows; prevents noisy whole-file diffs from agents. |

---

## 10. Security and privacy

- Public repo: **no secrets, tokens, private repo names/URLs, or proprietary details**. The owner's email is intentionally public (header `mailto:`).
- Client: `textContent` only, protocol allow-list on URLs, `rel="noopener"` on new-tab links, no third-party scripts, no cookies. The only storage is the `theme` key in `localStorage` (a UI preference, never sent anywhere).
- Validator enforces https for every outbound link and confines logo paths to `logos/` (no `..`).

---

## 11. Testing approach

- **Data:** `node scripts/validate.mjs`. Spot-check negative cases by running it against deliberately broken data.
- **Visual:** serve a scratch copy with sample entries (never commit sample entries to the real `projects.json`). Screenshot with headless Chrome, e.g.
  `chrome --headless=new --window-size=1280,1000 --virtual-time-budget=3000 --screenshot=out.png http://localhost:8765/`.
  - Dark mode: add `--blink-settings=preferredColorScheme=0`.
  - Forced theme: load with the toggle state preset, e.g. a wrapper page that sets `localStorage.theme` then redirects, or inject `document.documentElement.dataset.theme = "dark"`.
  - Phone width: headless Chrome enforces a minimum window width, so load the page inside a 375px-wide `<iframe>` wrapper page.
  - Tooltips: inject CSS forcing `[data-tip]::after { opacity:1 }`.
- **Checklist:** theme toggle flips light/dark, its icon and tooltip update, and the choice survives a reload; ™ shows after every title and ® when `mark: "r"`; footer © line and the trademark notice wording; filter hides/shows tiles; `#tag=X` deep link works; fallback logo renders when `logo` is missing or broken; no horizontal scroll at 375px; dark-mode contrast of the selected chip; tooltips not clipped.

---

## 12. Change checklist

When changing anything beyond a single project entry:

1. **Schema change** (add/rename/remove a field): update `ALLOWED` and the checks in `scripts/validate.mjs`, the rendering in `assets/app.js`, the field table and example in `INSTRUCTIONS.md`, and §5 here. Migrate existing entries in the same commit.
2. **New platform type:** SVG in `assets/platforms/`, entry in `assets/platforms.json`, row in INSTRUCTIONS.md's platform table, key list in §5.
3. **Trademark/copyright change:** a project becomes registered → set `"mark": "r"` on that entry only. Owner name or start year → the `OWNER`/`START_YEAR` constants in `app.js`, the footer and `<meta name="copyright">` in `index.html`, the README footer, and §1 here.
4. **Header/social/tagline change:** `index.html` (header and `<meta>`/OG description) and §1 here.
5. **Design change:** edit tokens in `:root` and **both** dark blocks in `style.css`. Re-run the visual tests in §11.
6. Run the validator, commit with a descriptive message, push to `main`, verify the deploy (§8).
7. **Update this file** in the same commit if any fact in it changed.

---

## 13. Possible future improvements (not committed to)

- Gate deploys on validation (Pages source → GitHub Actions).
- Server-render tiles into `index.html` at deploy time for SEO/no-JS.
- Per-project JSON files plus a generated manifest, to eliminate merge conflicts.
- Multi-select filter or a search box once the project count grows.
- Automated link checking (detect dead `pageUrl`/platform links) on a schedule.
- Open Graph preview image.
- Show the mark in other places where a project name appears, if any are added later (e.g. per-project OG text).

---

## 14. History

- **2026-10-27:** Repo created. Site template, `INSTRUCTIONS.md`, validator, CI, and Pages deployment set up. No project entries yet (by design; each project's agent adds its own).
- **2026-10-27:** Added copyright notices (footer with auto year range, meta tag, README) and trademark marks: superscript ™ after every project name by default, ® via `"mark": "r"` on the owner's explicit instruction. The footer trademark notice and validator rules were added with it.
- **2026-10-29:** Added a light/dark toggle button (top-right of the header). Defaults to the OS preference; an explicit choice is saved in `localStorage` and applied before first paint.
- **2026-10-30:** Added the footer motto "Build things you’d be proud to show." above the © line.

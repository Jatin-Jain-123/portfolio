// Validates projects.json against the rules in INSTRUCTIONS.md.
// Usage: node scripts/validate.mjs   (exits 1 and lists every problem if anything is wrong)
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (e) {
    console.error(`✗ ${rel} is not valid JSON: ${e.message}`);
    process.exit(1);
  }
}

const platforms = readJson("assets/platforms.json");
const data = readJson("projects.json");

for (const [key, meta] of Object.entries(platforms)) {
  if (!existsSync(join(root, "assets/platforms", `${key}.svg`))) fail(`platforms.json "${key}"`, `missing icon assets/platforms/${key}.svg`);
  if (typeof meta.label !== "string" || typeof meta.action !== "string") fail(`platforms.json "${key}"`, `needs string "label" and "action"`);
}

const ALLOWED = new Set(["slug", "title", "logo", "pageUrl", "description", "tags", "platforms", "order", "addedOn", "mark"]);
const MARKS = new Set(["tm", "r"]);
const LEGAL_SYMBOLS = /[™®©]|\((tm|r|c)\)/i;
const LOGO_EXT = new Set([".svg", ".png", ".webp", ".jpg", ".jpeg"]);
const MAX_LOGO_BYTES = 300 * 1024;

const isHttps = (s) => {
  try { return new URL(s).protocol === "https:"; } catch { return false; }
};

if (!data || !Array.isArray(data.projects)) {
  fail("projects.json", `must be an object with a "projects" array`);
} else {
  const slugs = new Set();
  data.projects.forEach((p, i) => {
    const at = `projects[${i}]${p && p.slug ? ` (${p.slug})` : ""}`;
    if (!p || typeof p !== "object") return fail(at, "must be an object");

    for (const k of Object.keys(p)) if (!ALLOWED.has(k)) fail(at, `unknown field "${k}"`);

    if (typeof p.slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) fail(at, `"slug" must be lowercase kebab-case`);
    else if (slugs.has(p.slug)) fail(at, `duplicate slug "${p.slug}"`);
    else slugs.add(p.slug);

    if (typeof p.title !== "string" || !p.title.trim() || p.title.length > 40) fail(at, `"title" is required, max 40 characters`);
    else if (LEGAL_SYMBOLS.test(p.title)) fail(at, `"title" must not contain ™/®/©; the page adds the mark itself (see "mark")`);

    if (p.mark !== undefined && !MARKS.has(p.mark)) fail(at, `"mark" must be "tm" or "r" (omit it for the default ™)`);

    if (typeof p.description !== "string" || p.description.length < 40 || p.description.length > 240)
      fail(at, `"description" must be 40-240 characters (is ${typeof p.description === "string" ? p.description.length : "missing"})`);
    else if (LEGAL_SYMBOLS.test(p.description)) fail(at, `"description" must not contain ™/®/© symbols`);

    if (!isHttps(p.pageUrl)) fail(at, `"pageUrl" must be an https URL to the project's public GitHub Pages site`);

    if (p.logo !== undefined) {
      if (typeof p.logo !== "string" || !p.logo.startsWith("logos/") || p.logo.includes("..")) fail(at, `"logo" must be a path inside logos/`);
      else if (!LOGO_EXT.has(extname(p.logo).toLowerCase())) fail(at, `"logo" must be .svg, .png, .webp or .jpg`);
      else if (!existsSync(join(root, p.logo))) fail(at, `logo file ${p.logo} does not exist`);
      else if (statSync(join(root, p.logo)).size > MAX_LOGO_BYTES) fail(at, `logo file is larger than 300 KB`);
    }

    if (p.tags !== undefined) {
      if (!Array.isArray(p.tags) || p.tags.length > 3) fail(at, `"tags" must be an array of at most 3 strings`);
      else p.tags.forEach((t) => {
        if (typeof t !== "string" || !t.trim() || t.length > 24) fail(at, `tag ${JSON.stringify(t)} must be a non-empty string, max 24 characters`);
      });
    }

    if (!Array.isArray(p.platforms)) fail(at, `"platforms" must be an array (use [] if none)`);
    else {
      const seen = new Set();
      p.platforms.forEach((pl, j) => {
        const pat = `${at} platforms[${j}]`;
        if (!pl || !platforms[pl.type]) return fail(pat, `unknown type ${JSON.stringify(pl && pl.type)}; allowed: ${Object.keys(platforms).join(", ")}`);
        if (seen.has(pl.type)) fail(pat, `duplicate platform "${pl.type}"`);
        seen.add(pl.type);
        if (!isHttps(pl.url)) fail(pat, `"url" must be an https URL`);
        for (const k of Object.keys(pl)) if (k !== "type" && k !== "url") fail(pat, `unknown field "${k}"`);
      });
    }

    if (p.order !== undefined && !Number.isFinite(p.order)) fail(at, `"order" must be a number`);

    if (typeof p.addedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.addedOn) || isNaN(Date.parse(p.addedOn)))
      fail(at, `"addedOn" must be a YYYY-MM-DD date`);
  });
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) found:\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ projects.json is valid (${data.projects.length} project(s), ${Object.keys(platforms).length} platform types)`);

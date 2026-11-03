// Renders the portfolio grid from projects.json. No build step, no dependencies.
(() => {
  "use strict";

  const grid = document.getElementById("grid");
  const emptyEl = document.getElementById("empty");
  const template = document.getElementById("tile-template");

  const OWNER = "Jatin Jain";

  // Copyright years: "2026", becoming "2026–2027" etc. as time passes.
  const START_YEAR = 2026;
  const thisYear = new Date().getFullYear();
  document.getElementById("year").textContent = thisYear > START_YEAR ? `${START_YEAR}–${thisYear}` : String(START_YEAR);

  // Every project name carries a mark. ™ by default; ® only when the entry says "mark": "r".
  const MARKS = {
    tm: { symbol: "™", noun: "trademark" },
    r: { symbol: "®", noun: "registered trademark" },
  };
  const markOf = (project) => MARKS[project.mark] || MARKS.tm;

  function setIcon(el, src) {
    const value = `url("${src}")`;
    el.style.webkitMaskImage = value;
    el.style.maskImage = value;
  }

  document.querySelectorAll("[data-icon]").forEach((el) => setIcon(el, el.dataset.icon));

  // Light/dark toggle. Dark by default; a visitor's choice is kept in localStorage
  // and applied before first paint by the inline script in index.html.
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const currentTheme = () => (root.dataset.theme === "light" ? "light" : "dark");

  function syncThemeToggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    const label = `Switch to ${next} mode`;
    themeToggle.dataset.tip = label;
    themeToggle.setAttribute("aria-label", label);
    setIcon(themeToggle.querySelector(".icon"), next === "dark" ? "assets/theme/moon.svg" : "assets/theme/sun.svg");
  }

  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch { /* storage blocked: choice lasts for this page view */ }
    syncThemeToggle();
  });
  syncThemeToggle();

  // Only ever link to http(s) URLs coming from the data file.
  function safeUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
    } catch {
      return null;
    }
  }

  function hueFor(text) {
    let h = 0;
    for (const ch of text) h = (h * 31 + ch.codePointAt(0)) % 360;
    return h;
  }

  function fallbackLogo(project) {
    const el = document.createElement("span");
    el.className = "logo-fallback";
    el.textContent = project.title.trim().charAt(0).toUpperCase();
    el.style.background = `hsl(${hueFor(project.slug)} 55% 50%)`;
    return el;
  }

  // Lower `order` first; projects without `order` follow, newest `addedOn` first.
  function compareProjects(a, b) {
    const oa = Number.isFinite(a.order) ? a.order : Infinity;
    const ob = Number.isFinite(b.order) ? b.order : Infinity;
    if (oa !== ob) return oa - ob;
    return String(b.addedOn || "").localeCompare(String(a.addedOn || ""));
  }

  function buildTile(project, platforms) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.slug = project.slug;

    const logo = node.querySelector(".logo");
    const pageUrl = safeUrl(project.pageUrl);
    if (pageUrl) logo.href = pageUrl;
    logo.dataset.tip = "Open project page for full details";
    logo.classList.add("tip-start");
    const mark = markOf(project);
    logo.setAttribute("aria-label", `${project.title}${mark.symbol}: open project page`);

    if (project.logo) {
      const img = document.createElement("img");
      img.src = project.logo;
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", () => img.replaceWith(fallbackLogo(project)), { once: true });
      logo.append(img);
    } else {
      logo.append(fallbackLogo(project));
    }

    const titleEl = node.querySelector(".title");
    titleEl.textContent = project.title;
    const sup = document.createElement("sup");
    sup.className = "mark";
    sup.textContent = mark.symbol;
    sup.dataset.tip = `${project.title} is a ${mark.noun} of ${OWNER}`;
    sup.tabIndex = 0;
    titleEl.append(sup);
    node.querySelector(".desc").textContent = project.description;

    const tagsEl = node.querySelector(".tags");
    for (const tag of project.tags || []) {
      const li = document.createElement("li");
      li.className = "tag";
      li.textContent = tag;
      tagsEl.append(li);
    }

    const platformsEl = node.querySelector(".platforms");
    (project.platforms || []).forEach((p) => {
      const meta = platforms[p.type];
      const url = safeUrl(p.url);
      if (!meta || !url) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      const tip = `${meta.action} ${meta.label}`;
      a.dataset.tip = tip;
      a.setAttribute("aria-label", `${project.title}: ${tip}`);
      if (platformsEl.children.length === 0) a.classList.add("tip-start");
      const icon = document.createElement("span");
      icon.className = "icon";
      setIcon(icon, `assets/platforms/${p.type}.svg`);
      a.append(icon);
      li.append(a);
      platformsEl.append(li);
    });

    return node;
  }

  function render(projects, platforms) {
    projects.forEach((p) => grid.append(buildTile(p, platforms)));
  }

  function showEmpty(message) {
    emptyEl.textContent = message;
    emptyEl.hidden = false;
  }

  Promise.all([
    fetch("projects.json", { cache: "no-cache" }).then((r) => r.json()),
    fetch("assets/platforms.json", { cache: "no-cache" }).then((r) => r.json()),
  ])
    .then(([data, platforms]) => {
      const projects = (data.projects || []).filter((p) => p && p.slug && p.title).sort(compareProjects);
      if (projects.length === 0) return showEmpty("Projects are on their way. Check back soon.");
      render(projects, platforms);
    })
    .catch((err) => {
      console.error("Failed to load portfolio data", err);
      showEmpty("Couldn't load projects right now. Please refresh the page.");
    });
})();

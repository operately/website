// Helpers for the Serbian translations of the marketing pages.
//
// English pages live at their usual paths (e.g. /pricing). Serbian comes in
// two scripts:
//
//   - Latin under /sr (e.g. /sr/pricing). These are the source pages in
//     src/pages/sr.
//   - Cyrillic under /sr-cyrl (e.g. /sr-cyrl/pricing). These render the same
//     page components and are transliterated by src/middleware.js.
//
// Every translated page links to the others through hreflang alternates so
// search engines can serve the right language and script, with English as
// the x-default.

export const SITE_URL = "https://operately.com";

// English paths that have a Serbian translation.
export const SERBIAN_PAGES = [
  "/",
  "/features",
  "/pricing",
  "/self-hosted",
  "/open-source",
  "/what-is-operately",
  "/ai",
  "/okr-software",
  "/for/small-teams",
  "/for/nonprofits",
];

// The two Serbian scripts. `label` is the script's name written in that
// script, used for the language switch links.
export const SERBIAN_SCRIPTS = {
  latn: { prefix: "/sr", lang: "sr-Latn", label: "Srpski", scriptLabel: "Latinica" },
  cyrl: { prefix: "/sr-cyrl", lang: "sr-Cyrl", label: "Српски", scriptLabel: "Ћирилица" },
};

function normalizePath(path) {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function hasSerbianPage(englishPath) {
  return SERBIAN_PAGES.includes(normalizePath(englishPath));
}

// "/pricing" -> "/sr/pricing", "/" -> "/sr"
// "/pricing", "cyrl" -> "/sr-cyrl/pricing"
export function toSerbianPath(englishPath, script = "latn") {
  const { prefix } = SERBIAN_SCRIPTS[script];
  const path = normalizePath(englishPath);
  return path === "/" ? prefix : `${prefix}${path}`;
}

// "/sr/pricing" -> "latn", "/sr-cyrl" -> "cyrl", "/pricing" -> null
export function serbianScriptOf(path) {
  const normalized = normalizePath(path);
  for (const [script, { prefix }] of Object.entries(SERBIAN_SCRIPTS)) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return script;
  }
  return null;
}

// "/sr/pricing" -> "/pricing", "/sr-cyrl" -> "/"
export function toEnglishPath(serbianPath) {
  const script = serbianScriptOf(serbianPath);
  if (!script) {
    throw new Error(`Not a Serbian path: ${serbianPath}`);
  }
  const path = normalizePath(serbianPath).slice(SERBIAN_SCRIPTS[script].prefix.length);
  return path === "" ? "/" : path;
}

// Absolute URL in the same trailing-slash form Astro uses for canonicals.
export function absoluteUrl(path) {
  const normalized = normalizePath(path);
  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}/`;
}

// hreflang alternates for an English page and its Serbian translations.
// Plain "sr" points at the Latin version.
export function languageAlternates(englishPath) {
  if (!hasSerbianPage(englishPath)) {
    throw new Error(`No Serbian translation registered for ${englishPath}`);
  }
  const en = absoluteUrl(englishPath);
  const latn = absoluteUrl(toSerbianPath(englishPath, "latn"));
  const cyrl = absoluteUrl(toSerbianPath(englishPath, "cyrl"));
  return [
    { hreflang: "en", href: en },
    { hreflang: "sr", href: latn },
    { hreflang: "sr-Latn", href: latn },
    { hreflang: "sr-Cyrl", href: cyrl },
    { hreflang: "x-default", href: en },
  ];
}

// Language switch links shown on an English page that has a translation.
export function serbianLinksFor(englishPath) {
  if (!hasSerbianPage(englishPath)) {
    throw new Error(`No Serbian translation registered for ${englishPath}`);
  }
  return ["latn", "cyrl"].map((script) => ({
    href: toSerbianPath(englishPath, script),
    label: SERBIAN_SCRIPTS[script].label,
    hreflang: SERBIAN_SCRIPTS[script].lang,
  }));
}

// Everything a Serbian page needs to know about the script it is rendered
// in. Pass Astro.url.pathname; the same page component serves /sr/... and
// /sr-cyrl/....
export function serbianPage(pathname) {
  const script = serbianScriptOf(pathname);
  if (!script) {
    throw new Error(`Not a Serbian path: ${pathname}`);
  }
  const englishPath = toEnglishPath(pathname);
  const other = script === "latn" ? "cyrl" : "latn";
  const href = (path) => toSerbianPath(path, script);
  return {
    script,
    lang: SERBIAN_SCRIPTS[script].lang,
    englishPath,
    // Serbian path in the current script for an English path.
    href,
    // Absolute URL in the current script for an English path.
    url: (path) => absoluteUrl(href(path)),
    alternates: languageAlternates(englishPath),
    languageLinks: [
      { href: englishPath, label: "English", hreflang: "en" },
      {
        href: toSerbianPath(englishPath, other),
        label: SERBIAN_SCRIPTS[other].scriptLabel,
        hreflang: SERBIAN_SCRIPTS[other].lang,
      },
    ],
  };
}

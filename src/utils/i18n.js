// Helpers for the Serbian (sr) translations of the marketing pages.
//
// English pages live at their usual paths (e.g. /pricing) and their Serbian
// counterparts live under /sr (e.g. /sr/pricing). Every translated pair links
// to the other through hreflang alternates so search engines can serve the
// right language, with English as the x-default.

export const SITE_URL = "https://operately.com";

// English paths that have a Serbian translation under /sr.
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

function normalizePath(path) {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function hasSerbianPage(englishPath) {
  return SERBIAN_PAGES.includes(normalizePath(englishPath));
}

// "/pricing" -> "/sr/pricing", "/" -> "/sr"
export function toSerbianPath(englishPath) {
  const path = normalizePath(englishPath);
  return path === "/" ? "/sr" : `/sr${path}`;
}

// "/sr/pricing" -> "/pricing", "/sr" -> "/"
export function toEnglishPath(serbianPath) {
  const path = normalizePath(serbianPath);
  if (path === "/sr") return "/";
  if (!path.startsWith("/sr/")) {
    throw new Error(`Not a Serbian path: ${serbianPath}`);
  }
  return path.slice(3);
}

// Absolute URL in the same trailing-slash form Astro uses for canonicals.
export function absoluteUrl(path) {
  const normalized = normalizePath(path);
  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}/`;
}

// hreflang alternates for an English page and its Serbian translation.
export function languageAlternates(englishPath) {
  if (!hasSerbianPage(englishPath)) {
    throw new Error(`No Serbian translation registered for ${englishPath}`);
  }
  const en = absoluteUrl(englishPath);
  const sr = absoluteUrl(toSerbianPath(englishPath));
  return [
    { hreflang: "en", href: en },
    { hreflang: "sr", href: sr },
    { hreflang: "x-default", href: en },
  ];
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  SERBIAN_PAGES,
  absoluteUrl,
  hasSerbianPage,
  languageAlternates,
  toEnglishPath,
  toSerbianPath,
} from "./i18n.js";

const pagesDir = new URL("../pages/", import.meta.url);

function pageFileExists(routePath) {
  const base = routePath === "/" ? "index" : routePath.slice(1);
  return [`${base}.astro`, `${base}/index.astro`].some((candidate) =>
    existsSync(fileURLToPath(new URL(candidate, pagesDir))),
  );
}

test("maps English paths to Serbian paths and back", () => {
  assert.equal(toSerbianPath("/"), "/sr");
  assert.equal(toSerbianPath("/pricing"), "/sr/pricing");
  assert.equal(toSerbianPath("/for/nonprofits/"), "/sr/for/nonprofits");
  assert.equal(toEnglishPath("/sr"), "/");
  assert.equal(toEnglishPath("/sr/"), "/");
  assert.equal(toEnglishPath("/sr/for/small-teams"), "/for/small-teams");
  assert.throws(() => toEnglishPath("/pricing"));
});

test("builds hreflang alternates with English as x-default", () => {
  assert.deepEqual(languageAlternates("/pricing"), [
    { hreflang: "en", href: "https://operately.com/pricing/" },
    { hreflang: "sr", href: "https://operately.com/sr/pricing/" },
    { hreflang: "x-default", href: "https://operately.com/pricing/" },
  ]);
  assert.deepEqual(languageAlternates("/"), [
    { hreflang: "en", href: "https://operately.com/" },
    { hreflang: "sr", href: "https://operately.com/sr/" },
    { hreflang: "x-default", href: "https://operately.com/" },
  ]);
  assert.throws(() => languageAlternates("/legal/terms"));
});

test("absolute URLs use the trailing-slash form of Astro canonicals", () => {
  assert.equal(absoluteUrl("/"), "https://operately.com/");
  assert.equal(absoluteUrl("/sr"), "https://operately.com/sr/");
  assert.equal(absoluteUrl("/ai/"), "https://operately.com/ai/");
});

test("every registered translation has both an English and a Serbian page", () => {
  for (const path of SERBIAN_PAGES) {
    assert.ok(
      pageFileExists(path),
      `missing English page for ${path}`,
    );
    assert.ok(pageFileExists(toSerbianPath(path)), `missing Serbian page for ${path}`);
  }
});

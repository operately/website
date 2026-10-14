import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  SERBIAN_PAGES,
  absoluteUrl,
  hasSerbianPage,
  languageAlternates,
  serbianLinksFor,
  serbianPage,
  serbianScriptOf,
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

test("maps English paths to Serbian paths in both scripts and back", () => {
  assert.equal(toSerbianPath("/"), "/sr");
  assert.equal(toSerbianPath("/pricing"), "/sr/pricing");
  assert.equal(toSerbianPath("/for/nonprofits/"), "/sr/for/nonprofits");
  assert.equal(toSerbianPath("/", "cyrl"), "/sr-cyrl");
  assert.equal(toSerbianPath("/pricing", "cyrl"), "/sr-cyrl/pricing");
  assert.equal(toEnglishPath("/sr"), "/");
  assert.equal(toEnglishPath("/sr/"), "/");
  assert.equal(toEnglishPath("/sr/for/small-teams"), "/for/small-teams");
  assert.equal(toEnglishPath("/sr-cyrl/"), "/");
  assert.equal(toEnglishPath("/sr-cyrl/for/small-teams/"), "/for/small-teams");
  assert.throws(() => toEnglishPath("/pricing"));
  assert.throws(() => toEnglishPath("/srpski"));
});

test("detects the Serbian script from a path", () => {
  assert.equal(serbianScriptOf("/sr"), "latn");
  assert.equal(serbianScriptOf("/sr/pricing/"), "latn");
  assert.equal(serbianScriptOf("/sr-cyrl"), "cyrl");
  assert.equal(serbianScriptOf("/sr-cyrl/ai/"), "cyrl");
  assert.equal(serbianScriptOf("/pricing"), null);
  assert.equal(serbianScriptOf("/srpski"), null);
});

test("builds hreflang alternates for both scripts with English as x-default", () => {
  assert.deepEqual(languageAlternates("/pricing"), [
    { hreflang: "en", href: "https://operately.com/pricing/" },
    { hreflang: "sr", href: "https://operately.com/sr/pricing/" },
    { hreflang: "sr-Latn", href: "https://operately.com/sr/pricing/" },
    { hreflang: "sr-Cyrl", href: "https://operately.com/sr-cyrl/pricing/" },
    { hreflang: "x-default", href: "https://operately.com/pricing/" },
  ]);
  assert.deepEqual(languageAlternates("/"), [
    { hreflang: "en", href: "https://operately.com/" },
    { hreflang: "sr", href: "https://operately.com/sr/" },
    { hreflang: "sr-Latn", href: "https://operately.com/sr/" },
    { hreflang: "sr-Cyrl", href: "https://operately.com/sr-cyrl/" },
    { hreflang: "x-default", href: "https://operately.com/" },
  ]);
  assert.throws(() => languageAlternates("/legal/terms"));
});

test("English pages link to both Serbian scripts", () => {
  assert.deepEqual(serbianLinksFor("/ai"), [
    { href: "/sr/ai", label: "Srpski", hreflang: "sr-Latn" },
    { href: "/sr-cyrl/ai", label: "Српски", hreflang: "sr-Cyrl" },
  ]);
  assert.throws(() => serbianLinksFor("/contact"));
});

test("serbianPage describes the Latin and Cyrillic versions of a page", () => {
  const latin = serbianPage("/sr/pricing/");
  assert.equal(latin.lang, "sr-Latn");
  assert.equal(latin.href("/self-hosted"), "/sr/self-hosted");
  assert.equal(latin.url("/pricing"), "https://operately.com/sr/pricing/");
  assert.deepEqual(latin.languageLinks, [
    { href: "/pricing", label: "English", hreflang: "en" },
    { href: "/sr-cyrl/pricing", label: "Ћирилица", hreflang: "sr-Cyrl" },
  ]);

  const cyrillic = serbianPage("/sr-cyrl/");
  assert.equal(cyrillic.lang, "sr-Cyrl");
  assert.equal(cyrillic.href("/self-hosted"), "/sr-cyrl/self-hosted");
  assert.equal(cyrillic.url("/"), "https://operately.com/sr-cyrl/");
  assert.deepEqual(cyrillic.languageLinks, [
    { href: "/", label: "English", hreflang: "en" },
    { href: "/sr", label: "Latinica", hreflang: "sr-Latn" },
  ]);
  assert.deepEqual(cyrillic.alternates, languageAlternates("/"));

  assert.throws(() => serbianPage("/pricing"));
});

test("absolute URLs use the trailing-slash form of Astro canonicals", () => {
  assert.equal(absoluteUrl("/"), "https://operately.com/");
  assert.equal(absoluteUrl("/sr"), "https://operately.com/sr/");
  assert.equal(absoluteUrl("/sr-cyrl"), "https://operately.com/sr-cyrl/");
  assert.equal(absoluteUrl("/ai/"), "https://operately.com/ai/");
});

test("every registered translation has an English and a Serbian Latin page", () => {
  for (const path of SERBIAN_PAGES) {
    assert.ok(hasSerbianPage(path));
    assert.ok(pageFileExists(path), `missing English page for ${path}`);
    // The Cyrillic route (src/pages/sr-cyrl/[...slug].astro) renders this
    // same Latin page, so it must exist for both scripts to build.
    assert.ok(pageFileExists(toSerbianPath(path)), `missing Serbian page for ${path}`);
  }
  assert.ok(
    existsSync(fileURLToPath(new URL("sr-cyrl/[...slug].astro", pagesDir))),
    "missing Serbian Cyrillic route",
  );
});

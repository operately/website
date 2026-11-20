// Serbian Latin -> Cyrillic transliteration.
//
// The Serbian pages are written once, in Latin script, and the Cyrillic
// versions under /sr-cyrl are produced from them at render time (see
// src/middleware.js). Serbian has a one-to-one mapping between the two
// scripts, so the copy only has to be maintained in one place.
//
// Foreign words stay in Latin script, as is usual in Serbian Cyrillic text:
// product and company names, acronyms (OKR, AI), words with letters that do
// not exist in Serbian (q, w, x, y), and mixed-case names (GitHub, SaaS).
// Anything inside an element marked translate="no", <code>, <pre>, or an
// element whose lang is not sr-Cyrl (for example the English navigation) is
// left alone.

const LETTERS = {
  a: "а", b: "б", c: "ц", č: "ч", ć: "ћ", d: "д", đ: "ђ", e: "е", f: "ф",
  g: "г", h: "х", i: "и", j: "ј", k: "к", l: "л", m: "м", n: "н", o: "о",
  p: "п", r: "р", s: "с", š: "ш", t: "т", u: "у", v: "в", z: "з", ž: "ж",
};

const DIGRAPHS = { lj: "љ", nj: "њ", dž: "џ" };

// Words where "nj" or "dž" are two separate letters rather than one
// (prefix + root, or loan words). Matched against the lower-cased word.
const SPLIT_DIGRAPH_PREFIXES = [
  "nadž", "odž", "podž", "predž", "injekc", "konjug", "konjunk", "tanjug",
];

// Foreign names and terms that appear in the Serbian copy and must stay in
// Latin script. Inflected forms are written with a hyphen in the copy
// ("Docker-u"), so the suffix is transliterated and the name is kept.
export const PRESERVED_WORDS = new Set([
  // Product, plan, and company names.
  "Operately", "Cloud", "Free", "Pro", "Business", "Unlimited", "Backstage",
  "Apache", "Asana", "Basecamp", "Docker", "Discord", "Elephantis", "Jira",
  "Linux", "Monday", "Notion", "Perdoo", "Plane", "Slack", "Taiga", "Trello",
  "Claude", "Code", "Codex",
  // English terms kept as-is in the Serbian copy.
  "Agile", "Scrum", "Objectives", "Results", "objective", "results", "and",
  "cloud", "vs", "npm",
]);

function isForeignWord(word) {
  if (PRESERVED_WORDS.has(word)) return true;
  if (/[qwxy]/i.test(word)) return true;
  // Acronyms: OKR, AI, SSO, TB. Serbian words written in capitals would be
  // kept too, so write the copy in normal case and use CSS for all caps.
  if (word.length > 1 && word === word.toUpperCase()) return true;
  // Mixed case inside the word: GitHub, SaaS, OpenAI.
  if (/\p{Lu}/u.test(word.slice(1)) && word !== word.toUpperCase()) return true;
  return false;
}

function matchCase(source, cyrillic) {
  if (source === source.toLowerCase()) return cyrillic;
  if (source === source.toUpperCase()) return cyrillic.toUpperCase();
  return cyrillic.charAt(0).toUpperCase() + cyrillic.slice(1);
}

export function transliterateWord(word) {
  if (isForeignWord(word)) return word;

  const lower = word.toLowerCase();
  const keepDigraphsSplit = SPLIT_DIGRAPH_PREFIXES.some((prefix) => lower.startsWith(prefix));
  let out = "";
  let i = 0;
  while (i < word.length) {
    const pair = lower.slice(i, i + 2);
    if (!keepDigraphsSplit && DIGRAPHS[pair]) {
      out += matchCase(word.slice(i, i + 2), DIGRAPHS[pair]);
      i += 2;
      continue;
    }
    const ch = word[i];
    const mapped = LETTERS[ch.toLowerCase()];
    out += mapped ? (ch === ch.toLowerCase() ? mapped : mapped.toUpperCase()) : ch;
    i += 1;
  }
  return out;
}

// Transliterate plain text, word by word. HTML entities (&rarr;, &#39;) are
// kept as they are.
//
// Also kept: URLs and domains (github.com/operately), paths and package
// names (/install, @operately/cli), and words joined to digits (v2, 1TB).
const TEXT_TOKEN_RE =
  /&#?\w+;|(?:https?:\/\/|www\.)[^\s<]+|[\p{L}\d.-]+\.(?:com|org|net|io|dev|app)\b[^\s<]*|(?<![\p{L}\d])[@\/][\p{L}\d@._\/-]+|[\p{L}\d]+/gu;

export function transliterateText(text) {
  return text.replace(TEXT_TOKEN_RE, (token) =>
    /^\p{L}+$/u.test(token) ? transliterateWord(token) : token,
  );
}

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "source", "track", "wbr",
]);
const PRESERVED_ELEMENTS = new Set(["code", "pre", "kbd", "samp"]);
const TEXT_ATTRIBUTES = new Set(["alt", "title", "aria-label", "placeholder"]);
const META_TEXT_KEYS = new Set([
  "description", "og:title", "og:description", "og:image:alt",
  "twitter:title", "twitter:description", "twitter:image:alt",
]);
// schema.org properties that hold human-readable text.
const SCHEMA_TEXT_KEYS = new Set([
  "name", "description", "headline", "text", "alternateName", "abstract",
]);

const TOKEN_RE = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
const ATTR_RE = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttributes(source) {
  const attrs = {};
  for (const match of source.matchAll(ATTR_RE)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function transliterateTag(tag, name, attrSource, attrs) {
  const metaKey = name === "meta" ? (attrs.name ?? attrs.property ?? "").toLowerCase() : "";
  return tag.replace(attrSource, () =>
    attrSource.replace(ATTR_RE, (whole, attr, dq, sq, bare) => {
      const key = attr.toLowerCase();
      const value = dq ?? sq ?? bare;
      if (value === undefined) return whole;
      const translate = TEXT_ATTRIBUTES.has(key) || (key === "content" && META_TEXT_KEYS.has(metaKey));
      if (!translate) return whole;
      return whole.replace(value, () => transliterateText(value));
    }),
  );
}

// Only schema nodes marked with the target inLanguage (and their children)
// are transliterated. Site-wide nodes such as the Organization stay English.
function transliterateSchema(value, key, active, target) {
  if (Array.isArray(value)) {
    return value.map((item) => transliterateSchema(item, key, active, target));
  }
  if (value && typeof value === "object") {
    const lang = typeof value.inLanguage === "string" ? value.inLanguage.toLowerCase() : null;
    const nodeActive = lang ? lang === target : active;
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, transliterateSchema(v, k, nodeActive, target)]),
    );
  }
  if (active && typeof value === "string" && SCHEMA_TEXT_KEYS.has(key)) {
    return transliterateText(value);
  }
  return value;
}

function transliterateJsonLd(source, target) {
  try {
    const data = transliterateSchema(JSON.parse(source), null, false, target);
    return JSON.stringify(data).replace(/</g, "\\u003c");
  } catch {
    return source;
  }
}

// Transliterate the Serbian text of a rendered HTML document. Only content
// whose language is `targetLang` (inherited from <html lang> or any
// ancestor's lang attribute) is changed.
export function transliterateHtml(html, targetLang = "sr-Cyrl") {
  const target = targetLang.toLowerCase();
  // Each entry: { name, active } where active means "transliterate here".
  const stack = [{ name: "#root", active: false }];
  const current = () => stack[stack.length - 1];
  let out = "";
  let last = 0;

  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(html))) {
    const text = html.slice(last, match.index);
    out += current().active ? transliterateText(text) : text;
    last = TOKEN_RE.lastIndex;

    const tag = match[0];
    const name = match[1]?.toLowerCase();
    if (!name) {
      out += tag; // comment or doctype
      continue;
    }

    if (tag.startsWith("</")) {
      const index = stack.map((entry) => entry.name).lastIndexOf(name);
      if (index > 0) stack.length = index;
      out += tag;
      continue;
    }

    const attrSource = match[2] ?? "";
    const attrs = parseAttributes(attrSource);
    const parent = current();
    let active = parent.active;
    if (attrs.lang !== undefined) active = attrs.lang.toLowerCase() === target;
    if (attrs.translate === "no" || PRESERVED_ELEMENTS.has(name)) active = false;

    out += active ? transliterateTag(tag, name, attrSource, attrs) : tag;

    // Raw text elements: copy their content without tokenizing it.
    if (name === "script" || name === "style") {
      const closeRe = new RegExp(`</${name}\\s*>`, "gi");
      closeRe.lastIndex = last;
      const close = closeRe.exec(html);
      const end = close ? close.index : html.length;
      const body = html.slice(last, end);
      const isJsonLd = name === "script" && (attrs.type ?? "").toLowerCase() === "application/ld+json";
      out += active && isJsonLd ? transliterateJsonLd(body, target) : body;
      out += close ? close[0] : "";
      last = close ? closeRe.lastIndex : html.length;
      TOKEN_RE.lastIndex = last;
      continue;
    }

    if (!VOID_ELEMENTS.has(name) && !tag.endsWith("/>")) {
      stack.push({ name, active });
    }
  }

  const rest = html.slice(last);
  out += current().active ? transliterateText(rest) : rest;
  return out;
}

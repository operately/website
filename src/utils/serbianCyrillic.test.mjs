import { test } from "node:test";
import assert from "node:assert/strict";
import { transliterateHtml, transliterateText, transliterateWord } from "./serbianCyrillic.js";

test("transliterates Serbian Latin letters and digraphs", () => {
  assert.equal(transliterateWord("Počnite"), "Почните");
  assert.equal(transliterateWord("ljudi"), "људи");
  assert.equal(transliterateWord("Ljudi"), "Људи");
  assert.equal(transliterateWord("njih"), "њих");
  assert.equal(transliterateWord("Džejms"), "Џејмс");
  assert.equal(transliterateWord("međuvremenu"), "међувремену");
  assert.equal(transliterateWord("ćirilica"), "ћирилица");
});

test("keeps nj and dž as two letters where they belong to a prefix", () => {
  assert.equal(transliterateWord("podžanr"), "поджанр");
  assert.equal(transliterateWord("nadživeti"), "надживети");
  assert.equal(transliterateWord("injekcija"), "инјекција");
});

test("keeps foreign names, acronyms, and mixed-case words in Latin", () => {
  assert.equal(transliterateWord("Operately"), "Operately");
  assert.equal(transliterateWord("OKR"), "OKR");
  assert.equal(transliterateWord("AI"), "AI");
  assert.equal(transliterateWord("GitHub"), "GitHub");
  assert.equal(transliterateWord("SaaS"), "SaaS");
  assert.equal(transliterateWord("Weekdone"), "Weekdone");
  assert.equal(transliterateWord("cloud"), "cloud");
});

test("transliterates text but keeps entities, URLs, paths, and versions", () => {
  assert.equal(
    transliterateText("Šta je novo &rarr; v1.9 objavljena"),
    "Шта је ново &rarr; v1.9 објављена",
  );
  assert.equal(transliterateText("Rad na Docker-u i OKR-ovi"), "Рад на Docker-у и OKR-ови");
  assert.equal(
    transliterateText("Kod: github.com/operately/operately i Monday.com"),
    "Код: github.com/operately/operately и Monday.com",
  );
  assert.equal(transliterateText("Instalirajte @operately/operately-cli"), "Инсталирајте @operately/operately-cli");
  assert.equal(transliterateText("ciljevi/projekti"), "циљеви/пројекти");
});

test("transliterates only content in the target language", () => {
  const html = [
    '<!doctype html><html lang="sr-Cyrl"><head>',
    "<title>Cene - Operately</title>",
    '<meta name="description" content="Jednostavne cene">',
    '<meta property="og:image" content="https://operately.com/a.png">',
    "</head><body>",
    '<div lang="en"><nav>Pricing <a href="/sr">Srpski</a></nav></div>',
    '<main><h1 class="text-gray-900">Počnite besplatno</h1>',
    '<img src="/goal.png" alt="Ciljevi i projekti">',
    '<a href="/sr" lang="sr-Latn">Latinica</a>',
    '<ul translate="no"><li>Moonshot</li></ul>',
    "<pre><code>npm install<span lang=\"sr-Cyrl\"># Prijavite se</span></code></pre>",
    "<p>Cilj<br>ljudi</p></main>",
    "<script>const label = \"Cene\";</script>",
    "</body></html>",
  ].join("");

  const out = transliterateHtml(html);
  assert.match(out, /<title>Цене - Operately<\/title>/);
  assert.match(out, /content="Једноставне цене"/);
  assert.match(out, /content="https:\/\/operately.com\/a.png"/);
  assert.match(out, /<nav>Pricing <a href="\/sr">Srpski<\/a><\/nav>/);
  assert.match(out, /<h1 class="text-gray-900">Почните бесплатно<\/h1>/);
  assert.match(out, /alt="Циљеви и пројекти"/);
  assert.match(out, />Latinica</);
  assert.match(out, /<li>Moonshot<\/li>/);
  assert.match(out, /<code>npm install<span lang="sr-Cyrl"># Пријавите се<\/span><\/code>/);
  assert.match(out, /<p>Циљ<br>људи<\/p>/);
  assert.match(out, /const label = "Cene";/);
});

test("transliterates JSON-LD only in nodes marked with the target language", () => {
  const schema = {
    "@graph": [
      { "@type": "WebSite", name: "Operately", description: "Operately helps teams" },
      {
        "@type": "FAQPage",
        inLanguage: "sr-Cyrl",
        url: "https://operately.com/sr-cyrl/",
        mainEntity: [
          {
            "@type": "Question",
            name: "Šta je Operately?",
            acceptedAnswer: { "@type": "Answer", text: "Softver otvorenog koda." },
          },
        ],
      },
    ],
  };
  const html = `<html lang="sr-Cyrl"><head><script type="application/ld+json">${JSON.stringify(schema)}</script></head></html>`;
  const out = transliterateHtml(html);
  const json = JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

  assert.equal(json["@graph"][0].description, "Operately helps teams");
  assert.equal(json["@graph"][1]["@type"], "FAQPage");
  assert.equal(json["@graph"][1].url, "https://operately.com/sr-cyrl/");
  assert.equal(json["@graph"][1].mainEntity[0].name, "Шта је Operately?");
  assert.equal(json["@graph"][1].mainEntity[0].acceptedAnswer.text, "Софтвер отвореног кода.");
});

test("leaves pages in other languages unchanged", () => {
  const html = '<html lang="sr-Latn"><body><p>Počnite besplatno</p></body></html>';
  assert.equal(transliterateHtml(html), html);
});

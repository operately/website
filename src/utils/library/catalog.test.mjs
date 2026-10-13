import assert from "node:assert/strict";
import { test } from "node:test";
import { loadKpiTemplate, templateUseUrl } from "./catalog.mjs";

const definition = {
  name: "Website visitors",
  unit: "visitors",
  cadence: "monthly",
  description: null,
};
const template = {
  id: "visitors-123",
  type: "kpi",
  content_language: "en",
  definition: JSON.stringify(definition),
};
const options = { appOrigin: "http://localhost:4100", slug: "website-visitors", language: "en" };

test("defaults requests and import links to the production app", async () => {
  for (const appOrigin of [undefined, ""]) {
    const result = await loadKpiTemplate({ slug: "website-visitors", language: "en", appOrigin }, async (url) => {
      assert.equal(url.origin, "https://app.operately.com");
      return Response.json({ template });
    });
    assert.equal(result.useUrl, "https://app.operately.com/templates/visitors-123/use");
  }
});

test("supports a local origin override with a trailing slash", async () => {
  const result = await loadKpiTemplate({ ...options, appOrigin: "http://localhost:4100/" }, async (url) => {
    assert.equal(url.href, "http://localhost:4100/api/v2/curated_templates/get?slug=website-visitors&language=en");
    return Response.json({ template });
  });
  assert.equal(result.useUrl, "http://localhost:4100/templates/visitors-123/use");
});

test("uses the published definition and encoded template ID for creation", async () => {
  let request;
  const result = await loadKpiTemplate(options, async (url) => {
    request = url;
    return Response.json({ template });
  });
  assert.equal(new URL(request).searchParams.get("slug"), "website-visitors");
  assert.equal(new URL(request).searchParams.get("language"), "en");
  assert.equal(new URL(request).searchParams.has("id"), false);
  assert.deepEqual(result.definition, definition);
  assert.equal(
    result.useUrl,
    "http://localhost:4100/templates/visitors-123/use",
  );
});

test("rejects a missing template", async () => {
  await assert.rejects(
    loadKpiTemplate(options, async () => new Response(null, { status: 404 })),
    /website-visitors.*404/,
  );
});

test("propagates malformed definition JSON to the caller", async () => {
  await assert.rejects(
    loadKpiTemplate(options, async () =>
      Response.json({ template: { ...template, definition: "{" } }),
    ),
    SyntaxError,
  );
});

test("encodes template IDs in import links", () => {
  assert.equal(
    templateUseUrl(options.appOrigin, "a/b"),
    "http://localhost:4100/templates/a%2Fb/use",
  );
});

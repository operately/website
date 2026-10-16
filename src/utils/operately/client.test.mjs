import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { loadKpiTemplate } from "./client.mjs";

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
const originalOrigin = process.env.OPERATELY_APP_ORIGIN;

describe("Operately app client", { concurrency: false }, () => {
  afterEach(() => {
    restoreOrigin(originalOrigin);
  });

  test("defaults requests and import links to the production app", async () => {
    delete process.env.OPERATELY_APP_ORIGIN;
    const result = await loadKpiTemplate(
      { slug: "website-visitors", language: "en" },
      async (url) => {
        assert.equal(url.origin, "https://app.operately.com");
        assert.equal(
          url.href,
          "https://app.operately.com/api/v2/curated_templates/get?slug=website-visitors&language=en",
        );
        return Response.json({ template });
      },
    );
    assert.equal(result.useUrl, "https://app.operately.com/templates/visitors-123/use");
  });

  test("blank OPERATELY_APP_ORIGIN keeps the production app", async () => {
    process.env.OPERATELY_APP_ORIGIN = "  ";
    const result = await loadKpiTemplate(
      { slug: "website-visitors", language: "en" },
      async (url) => {
        assert.equal(url.origin, "https://app.operately.com");
        return Response.json({ template });
      },
    );
    assert.equal(result.useUrl, "https://app.operately.com/templates/visitors-123/use");
  });

  test("uses OPERATELY_APP_ORIGIN, including a trailing slash", async () => {
    process.env.OPERATELY_APP_ORIGIN = "http://localhost:4100/";
    const result = await loadKpiTemplate(
      { slug: "website-visitors", language: "en" },
      async (url) => {
        assert.equal(
          url.href,
          "http://localhost:4100/api/v2/curated_templates/get?slug=website-visitors&language=en",
        );
        return Response.json({ template });
      },
    );
    assert.equal(result.useUrl, "http://localhost:4100/templates/visitors-123/use");
  });

  test("uses the published definition and encoded template ID for creation", async () => {
    process.env.OPERATELY_APP_ORIGIN = "http://localhost:4100";
    let request;
    const result = await loadKpiTemplate(
      { slug: "website-visitors", language: "en" },
      async (url) => {
        request = url;
        return Response.json({ template });
      },
    );
    assert.equal(new URL(request).searchParams.get("slug"), "website-visitors");
    assert.equal(new URL(request).searchParams.get("language"), "en");
    assert.equal(new URL(request).searchParams.has("id"), false);
    assert.deepEqual(result.definition, definition);
    assert.equal(result.useUrl, "http://localhost:4100/templates/visitors-123/use");
  });

  test("rejects a missing template", async () => {
    await assert.rejects(
      loadKpiTemplate({ slug: "website-visitors", language: "en" }, async () =>
        new Response(null, { status: 404 }),
      ),
      /website-visitors.*404/,
    );
  });

  test("propagates malformed definition JSON to the caller", async () => {
    await assert.rejects(
      loadKpiTemplate({ slug: "website-visitors", language: "en" }, async () =>
        Response.json({ template: { ...template, definition: "{" } }),
      ),
      SyntaxError,
    );
  });

  test("encodes template IDs in import links", async () => {
    delete process.env.OPERATELY_APP_ORIGIN;
    const result = await loadKpiTemplate(
      { slug: "website-visitors", language: "en" },
      async () => Response.json({ template: { ...template, id: "a/b" } }),
    );
    assert.equal(result.useUrl, "https://app.operately.com/templates/a%2Fb/use");
  });
});

function restoreOrigin(value) {
  if (value === undefined) delete process.env.OPERATELY_APP_ORIGIN;
  else process.env.OPERATELY_APP_ORIGIN = value;
}

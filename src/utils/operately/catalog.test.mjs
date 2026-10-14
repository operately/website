import assert from "node:assert/strict";
import { test } from "node:test";
import { listPublicTemplates, loadPublicTemplate } from "./client.mjs";

const template = (slug, language = "en") => ({
  id: slug, slug, title: slug, type: "kpi", content_language: language,
  category: null, summary: null, updated_at: "2026-10-14T00:00:00Z",
});

test("reads every catalog page before filtering by language", async () => {
  const offsets = [];
  const result = await listPublicTemplates({ language: "en" }, async (url) => {
    const offset = Number(url.searchParams.get("offset"));
    offsets.push(offset);
    assert.equal(url.searchParams.get("limit"), "100");
    return Response.json({ total: 3, templates: offset === 0
      ? [template("portuguese", "pt"), template("first")]
      : [template("second")] });
  });
  assert.deepEqual(offsets, [0, 2]);
  assert.deepEqual(result.map(({ slug }) => slug), ["first", "second"]);
});

test("an empty published catalog is valid", async () => {
  assert.deepEqual(await listPublicTemplates({}, async () => Response.json({ total: 0, templates: [] })), []);
});

test("a failed later page cannot silently produce a partial catalog", async () => {
  await assert.rejects(listPublicTemplates({}, async (url) =>
    url.searchParams.get("offset") === "0"
      ? Response.json({ total: 2, templates: [template("first")] })
      : new Response(null, { status: 503 }),
  ), /catalog.*503/i);
});

test("rejects an incomplete or malformed catalog instead of looping or hiding it", async () => {
  for (const payload of [{ total: 2, templates: [] }, { templates: [] }, { total: 1, templates: [{}] }]) {
    await assert.rejects(listPublicTemplates({}, async () => Response.json(payload)), /catalog/i);
  }
});

test("loads definitions of every template type with encoded app links", async () => {
  for (const type of ["kpi", "goal", "project"]) {
    const definition = { name: "Example", unit: "%", cadence: "monthly" };
    const result = await loadPublicTemplate({ slug: "example", language: "en" }, async () =>
      Response.json({ template: { ...template("example"), id: "a/b", type, definition: JSON.stringify(definition) } }),
    );
    assert.equal(result.type, type);
    assert.deepEqual(result.definition, definition);
    assert.ok(result.useUrl.endsWith("/templates/a%2Fb/use"));
  }
});

test("rejects invalid detail definitions and mismatched catalog identity", async () => {
  for (const change of [{ definition: "null" }, { slug: "different", definition: "{}" }]) {
    await assert.rejects(loadPublicTemplate({ slug: "example", language: "en" }, async () =>
      Response.json({ template: { ...template("example"), ...change } }),
    ), /template/i);
  }
});

test("a successful missing template is omitted, but request failures propagate", async () => {
  const args = { slug: "missing", language: "en" };
  assert.equal(await loadPublicTemplate(args, async () => Response.json({ template: null })), null);
  await assert.rejects(loadPublicTemplate(args, async () => new Response(null, { status: 503 })), /503/);
  await assert.rejects(loadPublicTemplate(args, async () => { throw new Error("Network unavailable"); }), /Network unavailable/);
  await assert.rejects(loadPublicTemplate(args, async () => Response.json({})), /Invalid template/);
});

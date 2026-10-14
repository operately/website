import assert from "node:assert/strict";
import { test } from "node:test";
import { renderTemplateDescription } from "./rich-text.mjs";

test("preserves paragraphs, lists, and marks while escaping user content", () => {
  assert.equal(renderTemplateDescription({ type: "doc", content: [
    { type: "paragraph", content: [{ type: "text", text: "<script>bad</script>", marks: [{ type: "bold" }] }] },
    { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "A & B" }] }] }] },
  ] }), "<p><strong>&lt;script&gt;bad&lt;/script&gt;</strong></p><ul><li><p>A &amp; B</p></li></ul>");
});

test("removes unsafe links and never emits arbitrary node HTML or attributes", () => {
  const html = renderTemplateDescription({ type: "doc", content: [
    { type: "text", text: "link", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] },
    { type: "script", attrs: { onclick: "alert(1)" }, content: [{ type: "text", text: "text" }] },
  ] });
  assert.equal(html, '<a>link</a>text');
});

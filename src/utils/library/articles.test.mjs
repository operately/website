import assert from "node:assert/strict";
import { test } from "node:test";
import { visibleArticles } from "./articles.ts";

const articles = [
  { id: "draft", data: { published: false, order: 1 } },
  { id: "later", data: { published: true, order: 3 } },
  { id: "first", data: { published: true, order: 2 } },
];

test("production lists and routes exclude drafts and use editorial ordering", () => {
  assert.deepEqual(
    visibleArticles(articles).map((a) => a.id),
    ["first", "later"],
  );
});

test("explicit local previews include draft articles", () => {
  assert.deepEqual(
    visibleArticles(articles, { includeDrafts: true }).map((a) => a.id),
    ["draft", "first", "later"],
  );
});

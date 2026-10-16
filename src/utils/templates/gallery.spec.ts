import { beforeEach, expect, test } from "vitest";
import { initializeTemplateGallery } from "./gallery";

beforeEach(() => {
  window.history.replaceState(null, "", "/library/templates");
  document.body.innerHTML = `<section>
    <form hidden><input name="q">
    <select name="type"><option value="">All</option><option value="kpi">KPIs</option><option value="project">Projects</option><option value="goal">Goals</option></select><button type="reset">Clear</button></form>
    <span data-template-count></span><p data-template-empty hidden></p>
    <ul>${[
      ["visitors", "kpi", "website visitors traffic"],
      ["launch", "project", "website launch"],
      ["revenue", "kpi", "monthly revenue"],
    ].map(([id, type, search]) => `<li id="${id}" data-template-card data-type="${type}" data-search="${search}"></li>`).join("")}</ul>
  </section>`;
});

function initialize() {
  const root = document.querySelector<HTMLElement>("section");
  if (!root) throw new Error("Missing gallery fixture");
  initializeTemplateGallery(root);
}
function visibleCards() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-template-card]"))
    .filter((card) => !card.hidden).map((card) => card.id);
}
function field(name: string, value: string) {
  const control = document.querySelector<HTMLInputElement>(`[name="${name}"]`);
  if (!control) throw new Error("Missing filter");
  control.value = value;
  control.dispatchEvent(new Event("input", { bubbles: true }));
}

test("shows the complete catalog and filters it by search", () => {
  initialize();
  expect(visibleCards()).toEqual(["visitors", "launch", "revenue"]);
  field("q", "REVENUE");
  expect(visibleCards()).toEqual(["revenue"]);
  expect(window.location.search).toBe("?q=REVENUE");
});

test("combines type and individual search words", () => {
  initialize();
  field("type", "kpi");
  field("q", "traffic website");
  expect(visibleCards()).toEqual(["visitors"]);
});

test("restores filters from type links and handles zero results and reset", () => {
  window.history.replaceState(null, "", "/library/templates?type=project");
  initialize();
  expect(visibleCards()).toEqual(["launch"]);
  field("q", "missing");
  expect(visibleCards()).toEqual([]);
  expect(document.querySelector<HTMLElement>("[data-template-empty]")?.hidden).toBe(false);
  document.querySelector("form")?.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
  expect(visibleCards()).toEqual(["visitors", "launch", "revenue"]);
  expect(window.location.search).toBe("");
});

test("a category without templates shows an empty result instead of the full catalog", () => {
  window.history.replaceState(null, "", "/library/templates?type=goal");
  initialize();
  expect(visibleCards()).toEqual([]);
  expect(document.querySelector<HTMLElement>("[data-template-empty]")?.hidden).toBe(false);
});

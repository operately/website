import { expect, test } from "vitest";
import { catalogPath } from "./presentation";

test("catalog links open the full template browser and preserve filters", () => {
  expect(catalogPath()).toBe("/library/templates");
  expect(catalogPath({ type: "goal" })).toBe("/library/templates?type=goal");
  expect(catalogPath({ type: "kpi", q: "monthly revenue" })).toBe("/library/templates?type=kpi&q=monthly+revenue");
});

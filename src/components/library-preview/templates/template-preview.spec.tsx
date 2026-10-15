import React from "react";
import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { TemplateLivePreview } from "./TemplateLivePreview";
import type { PublicTemplate } from "../../../utils/templates/types";

afterEach(cleanup);

const template: PublicTemplate = {
  id: "example", slug: "example", title: "Release template", type: "project",
  category: null, summary: null, content_language: "en", updated_at: "2026-10-14T00:00:00Z",
  useUrl: "/templates/example/use",
  definition: {
    name: "Product release", duration_days: 14,
    milestones: [{ key: "launch", title: "Launch", due_offset_days: 10 }],
    tasks: [{ key: "review", name: "Review release notes", milestone_key: "launch", due_offset_days: 7 }],
  },
};

async function preview(value: PublicTemplate) {
  const { container, unmount } = render(<TemplateLivePreview template={value} />);
  const root = await waitFor(() => {
    const shadow = container.querySelector("[data-shadow-preview]")?.shadowRoot;
    if (!shadow?.querySelector('[data-test-id="template-preview"]')) throw new Error("Preview not ready");
    return shadow;
  }, { timeout: 15000 });
  return { root, unmount };
}

test("renders the real project preview from its definition and opens its tasks", async () => {
  const original = structuredClone(template);
  const { root } = await preview(template);
  expect(root.textContent).toContain("Product release");
  expect(root.textContent).toContain("Launch");
  const tasks = Array.from(root.querySelectorAll<HTMLElement>("a, button")).find((el) => el.textContent?.trim().startsWith("Tasks"));
  if (!tasks) throw new Error("Missing tasks tab");
  fireEvent.click(tasks);
  await waitFor(() => expect(root.textContent).toContain("Review release notes"));
  expect(template).toEqual(original);
});

test("renders KPI configuration without inventing measurement history", async () => {
  const { root } = await preview({ ...template, type: "kpi", definition: { name: "Website visits", unit: "visits", cadence: "weekly" } });
  expect(root.textContent).toContain("Website visits");
  expect(root.querySelectorAll('[data-test-id^="entry-row-"]')).toHaveLength(0);
  expect(root.querySelector('[data-test-id="chart-log-update"]')).toBeNull();
});

test("renders goal targets from the published template", async () => {
  const { root } = await preview({ ...template, type: "goal", definition: { name: "Grow adoption", targets: [{ name: "Active teams", from: 10, to: 30, unit: "teams" }] } });
  expect(root.textContent).toContain("Grow adoption");
  expect(root.textContent).toContain("Active teams");
});

 test("renders published relative KPI examples", async () => {
  const { root } = await preview({
    ...template,
    type: "kpi",
    definition: { name: "Website visits", unit: "visits", cadence: "monthly" },
    preview_data: JSON.stringify({
      entries: [{ period_offset: -2, value: 345 }, { period_offset: -1, value: 416 }],
      annotations: [{ period_offset: -1, title: "Campaign" }],
    }),
  });
  expect(root.querySelectorAll('[data-test-id^="entry-row-"]')).toHaveLength(2);
  expect(root.querySelector('[data-test-id^="kpi-chart-annotation-hit-"]')).not.toBeNull();
  expect(root.querySelector('[data-test-id="chart-log-update"]')).toBeNull();
});

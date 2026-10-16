import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SalesKpiPreview } from "./SalesKpiPreview";
import { createSalesFixtures } from "./fixtures";
import type { SalesKpiTemplate } from "./types";

const templates: SalesKpiTemplate[] = [
  {
    key: "pipeline",
    id: "pipeline",
    useUrl: "/templates/pipeline/use",
    definition: {
      name: "Monthly qualified pipeline created",
      unit: "USD",
      cadence: "monthly",
      description: null,
    },
  },
  {
    key: "wins",
    id: "wins",
    useUrl: "/templates/wins/use",
    definition: {
      name: "Monthly deals won",
      unit: "deals",
      cadence: "monthly",
      description: null,
    },
  },
  {
    key: "revenue",
    id: "revenue",
    useUrl: "/templates/revenue/use",
    definition: {
      name: "Monthly sales revenue",
      unit: "USD",
      cadence: "monthly",
      description: null,
    },
  },
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("preview values match the article and published definitions without mutating them", () => {
  const original = structuredClone(templates);
  const fixtures = createSalesFixtures(templates);
  expect(fixtures.kpis.map(({ name }) => name)).toEqual(
    templates.map(({ definition }) => definition.name),
  );
  expect(fixtures.kpis[0]?.entries.map(({ value }) => value)).toEqual([
    100000, 120000, 150000, 200000, 180000, 220000,
  ]);
  expect(fixtures.kpis[1]?.entries.map(({ value }) => value)).toEqual([
    6, 8, 10, 12, 11, 14,
  ]);
  expect(fixtures.kpis[2]?.entries.map(({ value }) => value)).toEqual([
    30000, 40000, 60000, 45000, 55000, 70000,
  ]);
  if (fixtures.kpis[0]) fixtures.kpis[0].name = "Local edit";
  expect(templates).toEqual(original);
  expect(createSalesFixtures(templates).kpis[0]?.name).toBe("Monthly qualified pipeline created");
});

test("loads the real KPI screen automatically and keeps it mounted when expanded", async () => {
  const { container } = render(<SalesKpiPreview templates={templates} />);
  const root = await waitFor(
    () => {
      const root = container.querySelector("[data-shadow-preview]")?.shadowRoot;
      expect(
        root?.querySelector('[data-test-id="space-kpis-page"]'),
      ).toBeTruthy();
      return root;
    },
    { timeout: 15000 },
  );
  expect(root?.querySelector('[data-test-id="chart-log-update"]')).toBeTruthy();
  if (!root) throw new Error("The preview did not mount its shadow root");
  const request = vi.fn(() => {
    throw new Error("Demo mutations must not make network requests");
  });
  vi.stubGlobal("fetch", request);
  fireEvent.click(requiredElement(root, '[data-test-id="chart-log-update"]'));
  const form = await waitFor(() =>
    requiredElement(root, '[data-test-id="log-update-modal"] form'),
  );
  fireEvent.change(requiredElement(form, "input"), {
    target: { value: "75000" },
  });
  fireEvent.submit(form);
  await waitFor(() =>
    expect(root.querySelectorAll('[data-test-id^="entry-row-"]')).toHaveLength(
      7,
    ),
  );
  expect(request).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Expand preview" }));
  expect(screen.getByRole("dialog").getAttribute("aria-modal")).toBe("true");
  expect(container.querySelector("[data-shadow-preview]")?.shadowRoot).toBe(
    root,
  );
  expect(root.querySelectorAll('[data-test-id^="entry-row-"]')).toHaveLength(7);
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(container.querySelector("[data-shadow-preview]")?.shadowRoot).toBe(
    root,
  );
  fireEvent.click(screen.getByRole("button", { name: "Reset example" }));
  await waitFor(() =>
    expect(
      container.querySelector("[data-shadow-preview]")?.shadowRoot,
    ).not.toBe(root),
  );
  await waitFor(() =>
    expect(
      container
        .querySelector("[data-shadow-preview]")
        ?.shadowRoot?.querySelectorAll('[data-test-id^="entry-row-"]'),
    ).toHaveLength(6),
  );
});

function requiredElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Missing preview element: ${selector}`);
  return element;
}

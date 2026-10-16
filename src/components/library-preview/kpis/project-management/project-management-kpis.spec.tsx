import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProjectManagementKpiPreview } from "./ProjectManagementKpiPreview";
import { createProjectManagementFixtures } from "./fixtures";
import type { ProjectManagementKpiTemplate } from "./types";

const templates: ProjectManagementKpiTemplate[] = [
  {
    key: "onTime",
    id: "onTime",
    useUrl: "/templates/onTime/use",
    definition: {
      name: "On-time milestone rate",
      unit: "%",
      cadence: "weekly",
      description: null,
    },
  },
  {
    key: "overdue",
    id: "overdue",
    useUrl: "/templates/overdue/use",
    definition: {
      name: "Overdue milestones",
      unit: "milestones",
      cadence: "weekly",
      description: null,
    },
  },
  {
    key: "blocked",
    id: "blocked",
    useUrl: "/templates/blocked/use",
    definition: {
      name: "Blocked tasks",
      unit: "tasks",
      cadence: "weekly",
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
  const fixtures = createProjectManagementFixtures(templates);
  expect(fixtures.kpis.map(({ name }) => name)).toEqual(
    templates.map(({ definition }) => definition.name),
  );
  expect(fixtures.kpis[0]?.entries.map(({ value }) => value)).toEqual([
    80, 80, 60, 40, 80, 100,
  ]);
  expect(fixtures.kpis[1]?.entries.map(({ value }) => value)).toEqual([
    1, 2, 4, 7, 5, 2,
  ]);
  expect(fixtures.kpis[2]?.entries.map(({ value }) => value)).toEqual([
    1, 2, 4, 6, 3, 1,
  ]);
  if (fixtures.kpis[0]) fixtures.kpis[0].name = "Local edit";
  expect(templates).toEqual(original);
  expect(createProjectManagementFixtures(templates).kpis[0]?.name).toBe("On-time milestone rate");
});

test("loads the real KPI screen automatically and keeps it mounted when expanded", async () => {
  const { container } = render(<ProjectManagementKpiPreview templates={templates} />);
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
    target: { value: "60" },
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

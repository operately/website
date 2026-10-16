import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { loadProjectManagementKpis } from "./project-management-kpis";

const slugs = ["weekly-on-time-milestone-rate", "weekly-overdue-milestones", "weekly-blocked-project-tasks"];

function publishedTemplate(url: URL, overrides = {}) {
  const slug = url.searchParams.get("slug");
  return Response.json({
    template: {
      id: `resolved-${slug}`,
      definition: JSON.stringify({
        name: slug,
        unit: slug === slugs[0] ? "%" : slug === slugs[1] ? "milestones" : "tasks",
        cadence: "weekly",
        description: null,
        ...overrides,
      }),
    },
  });
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("OPERATELY_APP_ORIGIN", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("resolves English project KPI templates and environment-specific import links", async () => {
  vi.stubEnv("OPERATELY_APP_ORIGIN", "http://localhost:4100/");
  const request = vi.fn((url: URL) => publishedTemplate(url));
  vi.stubGlobal("fetch", request);
  const templates = await loadProjectManagementKpis();
  expect(templates?.map(({ key }) => key)).toEqual(["onTime", "overdue", "blocked"]);
  expect(request.mock.calls.map(([url]) => url.searchParams.get("slug"))).toEqual(slugs);
  expect(request.mock.calls.every(([url]) => url.origin === "http://localhost:4100" && url.searchParams.get("language") === "en")).toBe(true);
  expect(templates?.[0]?.useUrl).toBe(`http://localhost:4100/templates/resolved-${slugs[0]}/use`);
});

test.each([404, 500])("omits the complete example when one template returns %s", async (status) => {
  vi.stubGlobal("fetch", vi.fn((url: URL) =>
    url.searchParams.get("slug") === slugs[1] ? new Response(null, { status }) : publishedTemplate(url),
  ));
  expect(await loadProjectManagementKpis()).toBeNull();
});

test.each([{ cadence: "monthly" }, { unit: "hours" }])("omits incompatible definitions: %j", async (overrides) => {
  vi.stubGlobal("fetch", vi.fn((url: URL) => publishedTemplate(url, overrides)));
  expect(await loadProjectManagementKpis()).toBeNull();
});

test("omits the example when the catalog is unavailable", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network unavailable")));
  expect(await loadProjectManagementKpis()).toBeNull();
});

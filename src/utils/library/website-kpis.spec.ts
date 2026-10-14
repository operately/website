import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { loadWebsiteKpis } from "./website-kpis";

const visitorsSlug = "monthly-website-visitors";
const signupsSlug = "monthly-website-signups";
const conversionSlug = "website-visitor-to-signup-conversion-rate";

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("OPERATELY_APP_ORIGIN", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function publishedTemplate(url: URL) {
  const slug = url.searchParams.get("slug");
  return Response.json({
    template: {
      id: `resolved-${slug}`,
      type: "kpi",
      content_language: "en",
      definition: JSON.stringify({
        name: slug,
        unit: slug === visitorsSlug ? "visitors" : slug === signupsSlug ? "signups" : "%",
        cadence: "monthly",
        description: null,
      }),
    },
  });
}

test("loads the configured templates and production import links", async () => {
  const request = vi.fn(publishedTemplate);
  vi.stubGlobal("fetch", request);
  const templates = await loadWebsiteKpis();
  expect(templates?.map(({ key }) => key)).toEqual([
    "visitors", "signups", "conversion",
  ]);
  expect(request.mock.calls.map(([url]) => url.searchParams.get("slug"))).toEqual([
    visitorsSlug, signupsSlug, conversionSlug,
  ]);
  expect(request.mock.calls.every(([url]) => url.origin === "https://app.operately.com")).toBe(true);
  expect(request.mock.calls.every(([url]) => url.searchParams.get("language") === "en" && !url.searchParams.has("id"))).toBe(true);
  expect(templates?.[0]?.useUrl).toBe(
    `https://app.operately.com/templates/resolved-${visitorsSlug}/use`,
  );
});

test("sends catalog requests to OPERATELY_APP_ORIGIN", async () => {
  vi.stubEnv("OPERATELY_APP_ORIGIN", "http://localhost:4100/");
  const request = vi.fn(publishedTemplate);
  vi.stubGlobal("fetch", request);
  const templates = await loadWebsiteKpis();
  expect(request.mock.calls.every(([url]) => url.origin === "http://localhost:4100")).toBe(true);
  expect(templates?.[0]?.useUrl).toBe(
    `http://localhost:4100/templates/resolved-${visitorsSlug}/use`,
  );
});

test.each([404, 500])(
  "omits the entire example when one template returns %s",
  async (status) => {
    vi.stubGlobal("fetch", vi.fn((url: URL) =>
      url.searchParams.get("slug") === signupsSlug
        ? new Response(null, { status })
        : publishedTemplate(url),
    ));
    expect(await loadWebsiteKpis()).toBeNull();
  },
);

test("omits the example on a network failure", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Network unavailable")),
  );
  expect(await loadWebsiteKpis()).toBeNull();
});

test("omits the example when the template no longer matches the article", async () => {
  vi.stubGlobal("fetch", vi.fn(() => Response.json({
    template: {
      id: "visitors",
      type: "kpi",
      content_language: "en",
      definition: JSON.stringify({
        name: "Visitors", unit: "visitors", cadence: "weekly",
      }),
    },
  })));
  expect(await loadWebsiteKpis()).toBeNull();
});

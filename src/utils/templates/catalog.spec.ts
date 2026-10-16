import { beforeEach, expect, test, vi } from "vitest";

const { list, detail } = vi.hoisted(() => ({ list: vi.fn(), detail: vi.fn() }));
vi.mock("../operately/client.mjs", () => ({ listPublicTemplates: list, loadPublicTemplate: detail }));
beforeEach(() => { vi.resetModules(); vi.resetAllMocks(); });

test("an empty catalog produces no template routes or detail requests", async () => {
  list.mockResolvedValue([]);
  const { getTemplateCatalog } = await import("./catalog");
  expect(await getTemplateCatalog()).toEqual([]);
  expect(detail).not.toHaveBeenCalled();
});

test("omits successful missing definitions from the build snapshot", async () => {
  list.mockResolvedValue([{ slug: "missing" }, { slug: "available" }]);
  detail.mockImplementation(async ({ slug }) => slug === "missing" ? null : { slug, definition: { name: "Available" } });
  const { getTemplateCatalog } = await import("./catalog");
  expect(await getTemplateCatalog()).toEqual([{ slug: "available", definition: { name: "Available" } }]);
});

test("a failed definition aborts the build snapshot instead of publishing a partial catalog", async () => {
  list.mockResolvedValue([{ slug: "broken" }]);
  detail.mockRejectedValue(new Error("Request failed"));
  const { getTemplateCatalog } = await import("./catalog");
  await expect(getTemplateCatalog()).rejects.toThrow("Request failed");
});

import { afterEach, expect, test, vi } from "vitest";
import { TemplatePreviewElement } from "./element";

const { mount, unmount } = vi.hoisted(() => {
  const unmount = vi.fn();
  return { mount: vi.fn(() => unmount), unmount };
});
vi.mock("./mount", () => ({ mountTemplatePreview: mount }));
customElements.define("operately-template-preview", TemplatePreviewElement);

afterEach(() => {
  document.body.replaceChildren();
  vi.clearAllMocks();
});

function inertPreview() {
  const template = document.createElement("template");
  template.innerHTML = `<operately-template-preview data-template='{"id":"release"}'>
    <div data-live-preview>Loading preview…</div>
  </operately-template-preview>`;
  document.body.append(template);
  return template;
}

test("mounts prerendered data immediately on connection, unmounts, and can reopen", () => {
  const template = inertPreview();
  expect(mount).not.toHaveBeenCalled();
  document.body.append(template.content.cloneNode(true));
  expect(mount).toHaveBeenCalledOnce();
  const preview = document.querySelector("operately-template-preview");
  expect(mount.mock.calls[0]).toEqual([preview?.querySelector("[data-live-preview]"), { id: "release" }, "embedded"]);
  preview?.remove();
  expect(unmount).toHaveBeenCalledOnce();
  document.body.append(template.content.cloneNode(true));
  expect(mount).toHaveBeenCalledTimes(2);
});

test("passes full-screen mode to the preview runtime", () => {
  const template = inertPreview();
  const preview = template.content.querySelector<HTMLElement>("operately-template-preview");
  if (!preview) throw new Error("Missing preview");
  preview.dataset.mode = "fullscreen";
  document.body.append(template.content.cloneNode(true));
  expect(mount).toHaveBeenLastCalledWith(expect.any(HTMLElement), { id: "release" }, "fullscreen");
});

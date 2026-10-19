import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { initializeTemplatePreviewDialog } from "./preview-dialog";

let dispose: (() => void) | undefined;
beforeEach(() => {
  window.history.replaceState(null, "", "/library?q=website");
  document.body.innerHTML = `<section data-template-browser>
    <a href="/library/templates/first" data-template-open="first">First</a>
    <div hidden><a href="/library/templates/hidden" data-template-open="hidden">Hidden</a></div>
    <a href="/library/templates/last" data-template-open="last">Last</a>
    <dialog data-template-dialog aria-labelledby="template-preview-title">
      <a href="/library/templates" data-preview-close autofocus>Close</a>
      <div data-preview-content></div>
    </dialog>
    <template data-template-preview="first"><h2 id="template-preview-title">First</h2><a href="https://app.operately.com/templates/first/use">Use template</a></template>
    <template data-template-preview="last"><h2 id="template-preview-title">Last</h2></template>
  </section>`;
  const modal = dialog();
  modal.showModal = vi.fn(() => { modal.open = true; });
  modal.close = vi.fn(() => { modal.open = false; modal.dispatchEvent(new Event("close")); });
});

afterEach(() => {
  dispose?.();
  vi.restoreAllMocks();
  document.body.style.overflow = "";
});

function initialize() {
  const root = document.querySelector<HTMLElement>("[data-template-browser]");
  if (!root) throw new Error("Missing fixture");
  dispose = initializeTemplatePreviewDialog(root);
}
function click(selector: string, options: MouseEventInit = {}) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) throw new Error(`Missing ${selector}`);
  target.focus();
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, ...options });
  target.dispatchEvent(event);
  return event;
}
function dialog() {
  const element = document.querySelector("dialog");
  if (!element) throw new Error("Missing dialog");
  return element;
}

test("opens a shareable URL and closing restores the filtered gallery and focus", async () => {
  initialize();
  document.body.style.overflow = "auto";
  expect(click('[data-template-open="first"]').defaultPrevented).toBe(true);
  expect(window.location.pathname).toBe("/library/templates/first");
  expect(dialog().open).toBe(true);
  expect(document.body.style.overflow).toBe("hidden");
  expect(document.activeElement).toBe(document.querySelector("[data-preview-close]"));
  click("[data-preview-close]");
  await waitFor(() => expect(window.location.pathname + window.location.search).toBe("/library?q=website"));
  expect(dialog().open).toBe(false);
  expect(document.activeElement).toBe(document.querySelector('[data-template-open="first"]'));
  expect(document.body.style.overflow).toBe("auto");
});

test("Back and Forward restore the modal without toolbar navigation controls", async () => {
  initialize();
  click('[data-template-open="first"]');
  expect(window.location.pathname).toBe("/library/templates/first");
  window.history.back();
  await waitFor(() => expect(dialog().open).toBe(false));
  window.history.forward();
  await waitFor(() => expect(dialog().open).toBe(true));
  expect(dialog().querySelector("h2")?.textContent).toBe("First");
});

test("a direct URL opens its prerendered content without replacing it and closes to the catalog", () => {
  window.history.replaceState(null, "", "/library/templates/last");
  const content = dialog().querySelector<HTMLElement>("[data-preview-content]");
  if (!content) throw new Error("Missing content");
  content.dataset.previewSlug = "last";
  content.innerHTML = '<h2 id="template-preview-title">Prerendered last</h2>';
  const heading = content.firstElementChild;
  dialog().open = true;
  initialize();
  expect(dialog().showModal).toHaveBeenCalledOnce();
  expect(content.firstElementChild).toBe(heading);
  click("[data-preview-close]");
  expect(window.location.pathname).toBe("/library/templates");
  expect(dialog().open).toBe(false);
});

test("closing a preview returns to the full catalog with its type filter", async () => {
  window.history.replaceState(null, "", "/library/templates?type=project");
  initialize();
  click('[data-template-open="first"]');
  click("[data-preview-close]");
  await waitFor(() => expect(window.location.pathname + window.location.search).toBe("/library/templates?type=project"));
  expect(dialog().open).toBe(false);
});

test("Escape and backdrop clicks close the modal without losing the return URL", async () => {
  initialize();
  click('[data-template-open="first"]');
  dialog().dispatchEvent(new Event("cancel", { cancelable: true }));
  await waitFor(() => expect(window.location.pathname).toBe("/library"));
  click('[data-template-open="first"]');
  click("[data-preview-content] h2");
  expect(dialog().open).toBe(true);
  vi.spyOn(dialog(), "getBoundingClientRect").mockReturnValue({ left: 20, right: 200, top: 20, bottom: 200 } as DOMRect);
  click("dialog", { clientX: 10, clientY: 10 });
  await waitFor(() => expect(window.location.pathname).toBe("/library"));
  expect(dialog().open).toBe(false);
});

test("modified clicks retain normal new-tab link behavior", () => {
  initialize();
  const event = click('[data-template-open="first"]', { metaKey: true });
  expect(event.defaultPrevented).toBe(false);
  expect(dialog().open).toBe(false);
});

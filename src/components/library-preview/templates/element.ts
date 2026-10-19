import { mountTemplatePreview } from "./mount";

/** Template data is prerendered; the eagerly loaded runtime mounts connected previews. */
export class TemplatePreviewElement extends HTMLElement {
  private unmount?: () => void;

  connectedCallback() {
    const serialized = this.dataset.template;
    const host = this.querySelector<HTMLElement>("[data-live-preview]");
    if (!serialized || !host) return;
    try {
      this.unmount = mountTemplatePreview(host, JSON.parse(serialized), this.dataset.mode === "fullscreen" ? "fullscreen" : "embedded");
    } catch (error) {
      host.textContent = "The preview could not load. Reload this page to try again.";
      host.setAttribute("role", "alert");
      console.error("Could not load template preview", error);
    }
  }

  disconnectedCallback() {
    this.unmount?.();
    this.unmount = undefined;
  }
}

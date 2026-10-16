import React from "react";
import { createRoot } from "react-dom/client";
import { TemplateLivePreview } from "./TemplateLivePreview";
import type { PreviewMode } from "../shell/PreviewViewport";
import type { PublicTemplate } from "../../../utils/templates/types";

export function mountTemplatePreview(host: HTMLElement, template: PublicTemplate, mode: PreviewMode = "embedded") {
  const root = createRoot(host);
  root.render(<TemplateLivePreview template={template} mode={mode} />);
  return () => root.unmount();
}

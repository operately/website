import React, { useState } from "react";
import { MemoryRouter } from "react-router";
import { I18nextProvider } from "react-i18next";
import {
  CuratedTemplatePreviewPage,
  defaultFormattedTimePreferences,
  getTemplatePreviewReferenceDate,
  i18n,
  type CuratedTemplate,
} from "@operately/turboui";
import { PreviewViewport, type PreviewMode } from "../shell/PreviewViewport";
import { EmbeddedDemo } from "../shell/EmbeddedDemo";
import type { PublicTemplate } from "../../../utils/templates/types";

export function TemplateLivePreview({ template, mode = "embedded" }: { template: PublicTemplate; mode?: PreviewMode }) {
  const [referenceDate] = useState(() => getTemplatePreviewReferenceDate(new Date(), defaultFormattedTimePreferences.timezone));
  const preview: CuratedTemplate = {
    id: template.id,
    type: template.type,
    state: "published",
    title: template.definition.name || template.title,
    contentLanguage: template.content_language,
    definition: JSON.stringify(template.definition),
    insertedAt: `${referenceDate}T00:00:00Z`,
    updatedAt: template.updated_at,
  };

  return <PreviewBoundary>
    <PreviewViewport mode={mode}>
      <EmbeddedDemo cacheKey="template-preview">
        {/* The published preview includes admin navigation, which doesn't apply to the website. */}
        <style>{'[data-test-id="template-preview"] > header { display: none; }'}</style>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <CuratedTemplatePreviewPage
              template={preview}
              editorPath="/"
              referenceDate={referenceDate}
              formattedTimePreferences={defaultFormattedTimePreferences}
            />
          </MemoryRouter>
        </I18nextProvider>
      </EmbeddedDemo>
    </PreviewViewport>
  </PreviewBoundary>;
}

class PreviewBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p role="alert">The preview could not load. Reload this page to try again.</p>
      : this.props.children;
  }
}

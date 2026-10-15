import type { TemplateDefinition, TemplateType } from "@operately/turboui";

export interface PublicTemplate {
  id: string;
  slug: string;
  title: string;
  type: TemplateType;
  category: string | null;
  summary: string | null;
  content_language: string;
  updated_at: string;
  definition: TemplateDefinition;
  preview_data?: string;
  useUrl: string;
}

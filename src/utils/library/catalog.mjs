const defaultAppOrigin = "https://app.operately.com";

export function templateUseUrl(appOrigin, templateId) {
  return new URL(
    `/templates/${encodeURIComponent(templateId)}/use`,
    appOrigin || defaultAppOrigin,
  ).href;
}

export async function loadKpiTemplate({ appOrigin, slug, language }, request = fetch) {
  const url = new URL("/api/v2/curated_templates/get", appOrigin || defaultAppOrigin);
  url.searchParams.set("slug", slug);
  url.searchParams.set("language", language);
  const response = await request(url, { signal: AbortSignal.timeout(10000) });

  if (!response.ok)
    throw new Error(
      `Library template ${slug} (${language}) could not be read (${response.status})`,
    );
  const { template } = await response.json();

  return {
    id: template.id,
    definition: JSON.parse(template.definition),
    useUrl: templateUseUrl(appOrigin, template.id),
  };
}

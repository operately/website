const PRODUCTION_APP_ORIGIN = "https://app.operately.com";
const REQUEST_TIMEOUT_MS = 10_000;

function operatelyUrl(pathname, query = {}) {
  const url = new URL(pathname, appOrigin());
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return url;
}

async function operatelyGet(pathname, query = {}, request = fetch) {
  return request(operatelyUrl(pathname, query), {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

export async function listPublicTemplates({ language = "en" } = {}, request = fetch) {
  const templates = [];
  let offset = 0;
  let total;

  do {
    const response = await operatelyGet(
      "/api/v2/curated_templates/list",
      { limit: "100", offset: String(offset) },
      request,
    );
    if (!response.ok) throw new Error(`Template catalog could not be read (${response.status})`);

    const page = await response.json();
    if (!Number.isSafeInteger(page.total) || page.total < 0 || !Array.isArray(page.templates)) {
      throw new Error("Invalid template catalog response");
    }
    total = page.total;
    if (page.templates.length === 0 && offset < total) {
      throw new Error("Incomplete template catalog response");
    }
    for (const template of page.templates) validatePublicTemplate(template);
    templates.push(...page.templates);
    offset += page.templates.length;
  } while (offset < total);

  const localized = templates.filter((template) => template.content_language === language);
  if (new Set(localized.map((template) => template.slug)).size !== localized.length) {
    throw new Error("Template catalog changed during pagination; retry the build");
  }
  return localized;
}

export async function loadPublicTemplate({ slug, language }, request = fetch) {
  const response = await operatelyGet("/api/v2/curated_templates/get", { slug, language }, request);
  if (!response.ok) throw new Error(`Library template ${slug} (${language}) could not be read (${response.status})`);

  const { template } = await response.json();
  if (template === null) return null;
  validatePublicTemplate(template);
  if (template.slug !== slug || template.content_language !== language) {
    throw new Error(`Unexpected template returned for ${slug} (${language})`);
  }
  const definition = JSON.parse(template.definition);
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    throw new Error(`Invalid template definition for ${slug}`);
  }
  return {
    ...template,
    definition,
    useUrl: operatelyUrl(`/templates/${encodeURIComponent(template.id)}/use`).href,
  };
}

function validatePublicTemplate(template) {
  if (
    !template ||
    !["id", "title", "slug", "content_language", "updated_at"].every(
      (field) => typeof template[field] === "string" && template[field].length > 0,
    ) ||
    !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(template.slug) ||
    !["kpi", "goal", "project"].includes(template.type)
  ) {
    throw new Error("Invalid template in public catalog");
  }
}

export async function loadKpiTemplate({ slug, language }, request = fetch) {
  const response = await operatelyGet(
    "/api/v2/curated_templates/get",
    { slug, language },
    request,
  );

  if (!response.ok) {
    throw new Error(
      `Library template ${slug} (${language}) could not be read (${response.status})`,
    );
  }

  const { template } = await response.json();
  return {
    id: template.id,
    definition: JSON.parse(template.definition),
    useUrl: operatelyUrl(`/templates/${encodeURIComponent(template.id)}/use`).href,
  };
}

function appOrigin() {
  return configuredAppOrigin() ?? PRODUCTION_APP_ORIGIN;
}

function configuredAppOrigin() {
  const env = import.meta.env;
  const configured =
    env && typeof env === "object" ? env.OPERATELY_APP_ORIGIN : undefined;
  const value = typeof configured === "string" ? configured : process.env.OPERATELY_APP_ORIGIN;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

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

/**
 * Constructs a full URL given a path.
 * @param {AstroGlobal} Astro - The Astro global object from which to extract the base URL.
 * @param {string} path - The specific path to append to the base URL.
 * @return {string} The full URL.
 */
function buildFullUrl(Astro, path) {
  const fullUrl = new URL(Astro.request.url);
  const baseUrl = `${fullUrl.protocol}//${fullUrl.host}`;

  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${sanitizedPath}`;
}

export default buildFullUrl;

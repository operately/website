import { defineMiddleware } from "astro:middleware";
import { serbianScriptOf } from "./utils/i18n.js";
import { transliterateHtml } from "./utils/serbianCyrillic.js";

// Serbian Cyrillic pages (/sr-cyrl/...) render the Latin Serbian page
// components and are transliterated here, so the Serbian copy only lives in
// one script. Runs at build time for the static pages and on every request
// in the dev server.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (serbianScriptOf(context.url.pathname) !== "cyrl") return response;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !contentType.includes("text/html")) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(transliterateHtml(html, "sr-Cyrl"), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

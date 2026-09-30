import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const require = createRequire(import.meta.url);
const moduleId = "virtual:preview-css/shadow";
// Vite identifies virtual modules with a null-byte prefix.
const resolvedModuleId = `\0${moduleId}`;

/**
 * Adapt document roots and viewport rules to the demo's Shadow DOM container.
 * For example, @media (min-width: 1024px) becomes a container query, so layout
 * follows the simulated desktop width even when scaled down inside the article.
 * The published stylesheet stays unchanged.
 */
export function previewStyles() {
  return {
    name: "preview-lab-styles",
    resolveId(id) {
      if (id === moduleId) return resolvedModuleId;
    },
    async load(id) {
      if (id !== resolvedModuleId) return;
      const source = await readFile(require.resolve("@operately/turboui/styles.css"), "utf8");
      const css = adaptStyles(source);
      return `export default ${JSON.stringify(css)};`;
    },
  };
}

export function adaptStyles(source) {
  const sheet = postcss.parse(source);

  useContainerDimensions(sheet);
  adaptSelectors(sheet);

  return `${rootStyles()}\n${sheet.toString()}`;
}

function useContainerDimensions(sheet) {
  // Match simple Tailwind width breakpoints; leave other media queries unchanged.
  const widthBreakpoint = /^\((min|max)-width:\s*[\d.]+(px|rem)\)$/;
  sheet.walkAtRules("media", (rule) => {
    if (!widthBreakpoint.test(rule.params)) return;
    rule.name = "container";
    rule.params = `demo-viewport ${rule.params}`;
  });

  sheet.walkDecls((declaration) => {
    declaration.value = declaration.value.replace(/([\d.]+)vh\b/g, "$1cqh").replace(/([\d.]+)vw\b/g, "$1cqw");
  });
}

function adaptSelectors(sheet) {
  sheet.walkRules((rule) => {
    // Keyframe steps such as "from" and "to" aren't element selectors.
    if (rule.parent.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
    rule.selector = selectorParser((selectors) => {
      selectors.each((selector) => adaptSelector(selector));
    }).processSync(rule.selector);
  });
}

function adaptSelector(selector) {
  selector.walk((node) => {
    if (!isDocumentRoot(node)) return;
    node.replaceWith(demoRootSelector());
  });

  // Theme classes belong on the root itself.
  if ([".light", ".dark"].includes(selector.toString())) selector.prepend(demoRootSelector());
}

function isDocumentRoot(node) {
  return (
    (node.type === "tag" && ["html", "body"].includes(node.value)) ||
    (node.type === "pseudo" && [":root", ":host"].includes(node.value))
  );
}

function demoRootSelector() {
  return selectorParser.className({ value: "demo-root" });
}

function rootStyles() {
  // Reset inherited article styles, then establish the demo's base typography.
  const declarations = [
    "all:initial",
    "display:block",
    "font-family:Inter,sans-serif",
    "font-size:16px",
    "line-height:1.5",
    "color:#222",
    "text-align:left",
    "color-scheme:light",
  ];
  return `.demo-root{${declarations.join(";")}}`;
}

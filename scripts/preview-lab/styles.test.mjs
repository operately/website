import assert from "node:assert/strict";
import { test } from "node:test";
import { adaptStyles } from "./styles.mjs";

test("shadow styles adapt roots and responsive rules while preserving local animations", () => {
  const css = adaptStyles(
    `html, :host { line-height: 1.5 } body { margin: 0 }
    .light { --surface: white } *, ::before { box-sizing: border-box }
    @keyframes spin { to { transform: rotate(360deg) } }
    @media (min-width: 640px) { .sm\\:flex { display: flex; animation: spin 1s; max-height: 90vh; width: 100vw } }`,
  );
  assert.match(css, /\.demo-root \{ margin: 0 \}/);
  assert.match(css, /\.demo-root\.light/);
  assert.match(css, /\*, ::before/);
  assert.match(css, /@keyframes spin/);
  assert.match(css, /@container demo-viewport \(min-width: 640px\)/);
  assert.match(css, /animation: spin 1s/);
  assert.match(css, /max-height: 90cqh/);
  assert.match(css, /width: 100cqw/);
  assert.doesNotMatch(css, /\.demo-root to/);
});

test("shadow styles remap document roots without prefixing component selectors", () => {
  const css = adaptStyles(":root { --brand: blue } body { margin: 0 } .button { color: blue }");
  assert.match(css, /\.demo-root \{ --brand: blue \}/);
  assert.match(css, /\.button \{ color: blue \}/);
  assert.doesNotMatch(css, /#kpi-demo/);
});

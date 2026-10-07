import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { buildPosthogSnippet } from "./posthogSnippet.js";

test("embedded tracker initializes once and tracks marketing and help navigation", async () => {
  const events = [];
  const listeners = new Map();
  let initializations = 0;
  let sdkOptions;
  const sdk = {
    init(_token, options) {
      initializations++;
      sdkOptions = options;
      options.loaded(this);
    },
    get_distinct_id: () => "11111111-1111-4111-8111-111111111111",
    get_property: () => "anonymous",
    has_opted_out_capturing: () => false,
    resetGroups() {},
    capture(event, properties) {
      events.push(sdkOptions.before_send({ event, properties }));
    },
  };
  const document = {
    cookie: "",
    referrer: "",
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  const window = {
    document,
    location: new URL("https://operately.test/?utm_source=launch"),
    navigator: {},
    crypto: { randomUUID: () => "22222222-2222-4222-8222-222222222222" },
    posthog: sdk,
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  const globals = { window, document, location: window.location, URL };
  const script = buildPosthogSnippet({
    enabled: true,
    token: "test",
    host: "https://us.i.posthog.com",
  });
  const finishNavigation = () =>
    new Promise((resolve) => setImmediate(resolve));

  // Execute the actual inline script in a browser-like scope, without module imports.
  runInNewContext(script, globals);
  await finishNavigation();
  runInNewContext(script, globals);
  listeners.get("pageshow")({ persisted: false });
  await finishNavigation();

  window.location.pathname = "/help/getting-started";
  window.location.search = "";
  listeners.get("astro:page-load")();
  await finishNavigation();

  assert.equal(initializations, 1);
  assert.deepEqual(
    events.map((event) => event.event),
    ["$pageview", "$pageview"],
  );
  assert.deepEqual(
    events.map((event) => event.properties.page),
    ["/", "/help/getting-started"],
  );
  assert.equal(events[1].properties.acquisition.utm_source, "launch");
});

async function runSnippetAt(hostname, config = {}) {
  const initializations = [];
  const events = [];
  const listeners = new Map();
  let sdkOptions;
  const document = {
    cookie: "",
    referrer: "",
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  const window = {
    document,
    location: new URL(`https://${hostname}/`),
    navigator: {},
    crypto: { randomUUID: () => "22222222-2222-4222-8222-222222222222" },
    addEventListener: (name, callback) => listeners.set(name, callback),
    posthog: {
      init(token, options) {
        initializations.push({ token, options });
        sdkOptions = options;
        options.loaded(this);
      },
      get_distinct_id: () => "11111111-1111-4111-8111-111111111111",
      get_property: () => "anonymous",
      has_opted_out_capturing: () => false,
      resetGroups() {},
      capture(event, properties) {
        const sanitized = sdkOptions.before_send({ event, properties });
        if (sanitized) events.push(sanitized);
      },
    },
  };

  runInNewContext(buildPosthogSnippet(config), {
    window,
    document,
    location: window.location,
    URL,
  });
  await new Promise((resolve) => setImmediate(resolve));
  return {
    initializations,
    document,
    window,
    events,
    async dispatch(name, event = {}) {
      listeners.get(name)(event);
      await new Promise((resolve) => setImmediate(resolve));
    },
  };
}

test("production hosts use the existing project without deployment configuration", async () => {
  for (const hostname of ["operately.com", "www.operately.com"]) {
    const { initializations, document } = await runSnippetAt(hostname);
    assert.equal(initializations.length, 1, hostname);
    assert.equal(
      initializations[0].token,
      "phc_xf04u2FOMctiPEL4Ra5gH50ercpdlkgbYwBVdLpBtWA",
    );
    assert.equal(
      initializations[0].options.api_host,
      "https://us.i.posthog.com",
    );
    assert.match(document.cookie, /; Domain=\.operately\.com;/);
  }
});

test("local and preview hosts stay disabled by default", async () => {
  for (const hostname of [
    "localhost",
    "127.0.0.1",
    "[::1]",
    "preview.pages.dev",
    "staging.operately.com",
    "operately.com.example.org",
  ]) {
    const { initializations } = await runSnippetAt(hostname);
    assert.equal(initializations.length, 0, hostname);
  }
});

test("production tracking can be explicitly disabled", async () => {
  const { initializations } = await runSnippetAt("operately.com", {
    enabled: false,
  });
  assert.equal(initializations.length, 0);
});

test("local testing requires explicit enablement and a project token", async () => {
  for (const config of [{ enabled: true }, { token: "staging-project" }]) {
    const { initializations } = await runSnippetAt("localhost", config);
    assert.equal(initializations.length, 0);
  }

  const { initializations, document } = await runSnippetAt("localhost", {
    enabled: true,
    token: "staging-project",
    host: "https://eu.i.posthog.com",
  });
  assert.equal(initializations.length, 1);
  assert.equal(initializations[0].token, "staging-project");
  assert.equal(initializations[0].options.api_host, "https://eu.i.posthog.com");
  assert.equal(initializations[0].options.cross_subdomain_cookie, false);
  assert.doesNotMatch(document.cookie, /; Domain=/);
});

test("explicit cookie configuration overrides production defaults", async () => {
  const { initializations, document } = await runSnippetAt("operately.com", {
    token: "another-project",
    cookieDomain: "",
  });
  assert.equal(initializations[0].token, "another-project");
  assert.equal(initializations[0].options.cross_subdomain_cookie, false);
  assert.doesNotMatch(document.cookie, /; Domain=/);
});

for (const path of ["/", "/help/getting-started"]) {
  test(`back/forward-cache restores count new visits on ${path} without duplicate lifecycle events`, async () => {
    const browser = await runSnippetAt("operately.com");
    await browser.dispatch("pageshow", { persisted: false });
    await browser.dispatch("astro:page-load");
    assert.equal(browser.events.length, 1);

    if (path !== "/") {
      browser.window.location.pathname = path;
      await browser.dispatch("astro:page-load");
    }
    const originalCount = browser.events.length;

    await browser.dispatch("pageshow", { persisted: true });
    assert.equal(browser.events.length, originalCount + 1);
    assert.equal(browser.events.at(-1).event, "$pageview");
    assert.equal(browser.events.at(-1).properties.page, path);

    await browser.dispatch("astro:page-load");
    await browser.dispatch("pageshow", { persisted: false });
    browser.window.location.hash = "#section";
    await browser.dispatch("astro:page-load");
    assert.equal(browser.events.length, originalCount + 1);

    await browser.dispatch("pageshow", { persisted: true });
    assert.equal(browser.events.length, originalCount + 2);
    assert.equal(browser.initializations.length, 1);
  });
}

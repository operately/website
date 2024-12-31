# Developing the Operately website

[Help Center: Product documentation writing guide](help-center.md)

## Best practices

### General

- When in doubt, read [Astro docs][astro-docs], they're pretty good.
- Avoid doing exotic things, stick to defaults, always seek simple solutions.
- Always verify pull requests by browsing the preview site.

### Where to place partials and assets of a page

Create a subdirectory that starts with an underscore `_`, followed by the name of the page.

For example:

```
pages/features.astro
pages/_features/Header.astro
pages/_features/_ReactComponent.jsx
pages/_features/screenshot.png
```

This prevents warnings about `Unsupported file type`.

### Working with images

- Before committing new images to the repo, reduce their size with
  [ImageOptim][imageoptim] or equivalent tool.
- PNG for screenshots, JPEG for graphics.
- Astro's [`<Image/>`][astro-image] will optimize them further and convert
  to `.webp` at build time, which is good for readers and SEO.
- Therefore, always use either `<Image/>` or a custom component that wraps it.
  - Exception are a few brand images in `public/` of which we need absolute,
    immutable URLs at code level.

### Creating new components

To wrap & reuse a piece of markup, prefer creating
[Astro components][astro-components] over React components in `src/components/`.

Eg. if you create a React component that uses built-in Astro components and
call it in a page or another Astro component, the code may not even build
due to Astro components not rendering on the client[^1].

## Deployment

The website is hosted on CloudFlare Pages. Deployment is fully automated.

Changes to the `main` branch are automatically deployed to production.

All other branches are automatically deployed to preview sites.
Use them to perform final verification of changes before merging.

[^1]: This may not be a technically correct explanation, but it doesn't change the outcome.

[astro-components]: https://docs.astro.build/en/basics/astro-components/
[astro-docs]: https://docs.astro.build/
[astro-image]: https://docs.astro.build/en/guides/images/#image--astroassets
[imageoptim]: https://imageoptim.com/

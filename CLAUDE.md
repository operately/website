# Claude Development Notes

This file contains important context and guidelines for Claude when working on this Astro website.

## About This Website

This is the marketing and documentation website for **Operately** - a company operating system that helps organizations run operations, align teams, and drive growth without the need for a COO. Operately brings together goals & OKRs, project management, team workspaces, message boards, and document management into one unified platform.

The website serves both as a marketing site for potential customers and a comprehensive help center for existing users learning to use the platform effectively.

## Project Architecture

This is an Astro website with the following key integrations:
- **Astro 5+** - Main framework
- **Tailwind CSS v4** - Styling with Vite plugin
- **Starlight+** - Documentation system for `/help` section
- **React** - Interactive components
- **MDX** - Markdown content with components

## Styling System

### Tailwind CSS v4 Setup
- Uses `@tailwindcss/vite` plugin in `astro.config.mjs`
- Main CSS file: `src/styles/global.css`
- Typography plugin loaded via `@plugin "@tailwindcss/typography"` directive in CSS
- Custom colors defined in both `tailwind.config.mjs` and explicit CSS utilities

### Important CSS Files
- `src/styles/global.css` - Main Tailwind import and custom utilities
- `src/styles/starlight.css` - Starlight help section customizations
- `src/styles/anchor-links.css` - Anchor link styling

### Custom Colors
Due to Tailwind v4 config reliability issues, custom colors are defined as explicit CSS utilities:
- `text-operately-blue`, `bg-operately-blue`, `border-operately-blue` (#3185FF)
- `text-operately-dark-blue`, etc. (#024FAC)
- Additional tint variations available
- Would prefer to return to Tailwind defaults if possible in future versions

## Layout System

### Key Layouts
- `BaseLayout.astro` - Main site layout (imports `global.css`)
- `Article.astro` - Article/blog layout with prose styling
- `Handbook.astro`, `Job.astro`, `ReleasesLayout.astro` - Specialized layouts

**Important**: All layouts must import `../styles/global.css` to ensure Tailwind works properly.

## Starlight Documentation

### Configuration
- Config in `src/config/helpCenter.js`
- Uses `defaultLocale: "root"` to avoid URL prefixes
- Content in `src/content/docs/help/` - **comprehensive product documentation** including step-by-step guides, feature explanations, and practical examples for all Operately features (goals, projects, workspaces, discussions, documents, team management, etc.)
- Custom CSS in `customCss` array

### Common Issues
- Starlight has its own CSS system that can conflict with Tailwind
- Logo sizing issues often occur after upgrades
- Sidebar navigation can break with CSS conflicts

## Development Guidelines

### When Making CSS Changes
1. Always restart dev server after major config changes
2. Check both main site and `/help` section work
3. Ensure all layouts import `global.css`
4. Use explicit CSS utilities for custom colors rather than relying on config generation

### When Upgrading Dependencies
1. Check Starlight changelog for breaking changes
2. Test typography on article pages (prose styling)
3. Verify custom color utilities still work
4. Test both light/dark logo variants

### Typography
- Article pages use `prose` classes from Typography plugin
- Plugin loaded via `@plugin` directive, not config
- Custom link colors defined in `tailwind.config.mjs`

## Build & Development

### Commands
- `npm run dev` - Runs both Astro dev server (4321) and Wrangler (8788)
- `npm run build` - Production build
- Uses Cloudflare Pages for deployment

### Environment
- Development uses `.dev.vars` instead of `.env`
- Two-server setup: Astro for content, Wrangler for API functions

## Common Troubleshooting

### Broken Styling
1. Check if `global.css` is imported in the layout
2. Restart dev server
3. Verify Tailwind plugin is working in `astro.config.mjs`

### Starlight Issues
1. Check `helpCenter.js` configuration
2. Verify locale settings (use "root" not "en")
3. Clear `.astro` and `dist` cache directories

### Typography Not Working
1. Ensure `@plugin "@tailwindcss/typography"` is in `global.css`
2. Check if `prose` classes are applied in layout
3. Verify Typography plugin version compatibility

## Content & Role Guidelines

When working on this website, you should act as both a frontend engineer/designer and a content creator. The extensive product documentation in `/src/content/docs/help/` contains detailed descriptions of Operately's features, use cases, and workflows that you can leverage when creating or updating marketing content, landing pages, or other site content.

## File Structure Notes
- `/src/pages/` - Main site pages (marketing, landing pages, etc.)
- `/src/content/docs/help/` - Comprehensive end-user product documentation (step-by-step guides, feature overviews, tutorials)
- `/src/layouts/` - Reusable layouts
- `/src/components/` - React/Astro components
- `/src/styles/` - CSS files

# Handbook pages

Overall structure:
- `src/handbook.astro` - the index page and table of contents. ToC links need to be maintained manually.
- `src/playbook/*.mdx` - individual pages.
- `src/layouts/Handbook.astro` - the layout used to generate pages based on MDX files above.

## How to add a new page

- Copy one of the existing pages
- Edit frontmatter: title, description, name and slug of the next page (this renders the sidebar; can skip if it's the last page)
- Just write Markdown.
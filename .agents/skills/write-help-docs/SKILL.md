---
name: write-help-docs
description: >-
  Turn documentation briefs into Operately Help Center pages. Use when the user
  provides an audit, backlog, or notes describing what to document and asks to
  write or update help pages in src/content/docs/help/.
---

# Write Help Docs

Turn a documentation brief into Starlight help pages and sidebar entries in
this repo.

The brief may be a markdown audit file, pasted text, a link, or inline notes.
Treat it as the source of truth for UI labels, flows, permissions, and
cross-links. You can still complete the work without the product repo — ask the
user when anything is unclear.

For input-field mapping, MDX templates, sidebar sections, mini-examples, and
anti-patterns, read [reference.md](reference.md).

## Input

The user supplies what to document. Common formats:

- A structured audit with `new_page`, `update_page`, and `api_auto_sync` items
- A priority table plus per-item sections (`User capability`, `Flow`, etc.)
- An informal list of features or pages to write or refresh

**Where the brief comes from:** This skill only consumes whatever the user
provides — it does not generate the brief itself. A common source is the
**operately** product repo (`operately/operately`), which has a companion skill
at `.agents/skills/help-docs/` that audits releases or git history and outputs
a structured backlog (e.g. `help-center-audit-1.6.0.md`). Run that skill
in operately, then bring the resulting file or pasted content here. The two repos
are independent; operately-website does not need operately checked out to write
docs.

**Optional: operately as a sibling repo:** Many setups keep `operately` next to
`operately-website` on disk (e.g. `../operately/`). If you have access, you
may read the product repo to clarify UI labels, step order, or permissions when
the brief is ambiguous — but this is **not required**. Without operately
available, rely on the brief and **ask the user** rather than guessing. See
[reference.md — Product repo lookup](reference.md#product-repo-lookup) for
where to look (same paths as operately's `.agents/skills/help-docs/` skill).

If a `new_page` item is missing a slug, section, or enough flow detail to write
accurate steps, ask before proceeding.

## Scope

- Work only in **this repo**.
- Content lives in `src/content/docs/help/`.
- Sidebar lives in `src/config/helpCenter.js`.
- Quote UI labels exactly as given in the brief; do not polish or paraphrase.
- **Never** create or edit files under `src/content/docs/help/api/` — those
  pages are CI-generated.

## Workflow

### 1. Parse the brief into a work queue

Extract every documentation item and classify it:

| Action | What to do |
| ------ | ---------- |
| `new_page` | Create MDX + add sidebar entry |
| `update_page` | Edit existing page at `/help/{slug}` |
| `api_auto_sync` | Skip writing — acknowledge in the completion summary only |
| `skip` | Ignore |
| Conditional / audience-unclear | **Ask the user** before writing |

If the brief includes a priority table, process items high → medium → low.
Otherwise process `new_page` items before related `update_page` items when
order matters (e.g. create `manage-company-billing` before updating pages that
cross-link to it).

Track progress with a checklist copied from the brief.

### 2. Locate existing content

Before writing each item:

1. Read `src/config/helpCenter.js` for sidebar sections, labels, and link style.
2. Find the target file in `src/content/docs/help/`:
   - Flat: `src/content/docs/help/{slug}.mdx`
   - Folder: `src/content/docs/help/{slug}/index.mdx`
3. Read the closest existing page in the same section for tone and structure.

Use `Glob` or search — both flat and folder layouts exist in this repo.

### 3. Choose file layout for new pages

| Situation | Path |
| --------- | ---- |
| How-to with screenshots expected | `src/content/docs/help/{slug}/index.mdx` |
| Short reference without images | `src/content/docs/help/{slug}.mdx` |

When screenshots are needed but not supplied, add descriptive placeholder
images (see [reference.md — Screenshots](reference.md#screenshots)) and list
them in the completion summary.

### 4. Add or update sidebar entries

For each `new_page`, add an entry under the brief's suggested section in
`src/config/helpCenter.js`:

```js
{ label: "Manage company billing", link: "/help/manage-company-billing" },
```

- Match the **label style** of sibling entries in that section (sentence case vs
  title case).
- Match **trailing-slash style** of neighboring links in the same section — do
  not normalize the whole file.

Place new entries in a logical position (usually near related pages).

### 5. Write or update MDX

Map brief fields to page content using
[reference.md — Input field glossary](reference.md#input-field-glossary).

**New pages** — pick a template by `page type`:

| Page type | Structure |
| --------- | --------- |
| `how-to` | Intro → entry points → `<Steps>` → permissions / edge cases |
| `overview` | Concept intro → feature sections → when-to-use lists |
| `reference` | Who can do what → settings or behavior matrix → related links |

**Updates** — read the full existing file first. Preserve structure, imports,
and existing screenshots. Add or replace only the sections the brief calls out.

Standard imports (include only what the page uses):

```mdx
import { Steps, Aside } from '@astrojs/starlight/components';
import ImageEnhancer from '@/components/ImageEnhancer.astro';

<ImageEnhancer />
```

Frontmatter on every page:

```mdx
---
title: "Page title matching sidebar label"
description: "One sentence describing what the reader will learn."
---
```

Internal links use `/help/{slug}` (no domain). Resolve bare slugs from the
brief to full paths.

### 6. Add cross-links

Every new page must be linked from **at least one existing page's body text**,
not only the sidebar (see `AGENTS.md` — Page Linking Rule).

Use the brief's `Cross-links` field bidirectionally:

- New page → link to related existing pages where context fits.
- Related existing pages → add a sentence or `Aside` linking to the new page.

### 7. Handle conditional items

When the brief marks an item as conditional, tentative, or needing an audience
decision, stop and ask the user:

- Document it now (and in which section)?
- Skip it?
- Defer until product confirms?

Do not guess placement or audience.

### 8. Finish with a summary

Report:

- Pages created and updated (with slugs)
- Sidebar entries added
- Cross-links added on other pages
- `api_auto_sync` items acknowledged (not written)
- Conditional items deferred or skipped
- Screenshot placeholders needing real images
- Open questions carried over from the brief

## Definition of Done

Before finishing, verify:

- [ ] All `new_page` and `update_page` items from the brief are addressed
- [ ] `api_auto_sync` items acknowledged but no manual API pages written
- [ ] Each new slug has MDX + `helpCenter.js` entry in the correct section
- [ ] UI labels match the brief verbatim
- [ ] Cross-links added in both directions where the brief specifies them
- [ ] No files touched under `src/content/docs/help/api/`
- [ ] Summary lists conditional/skipped items, missing screenshots, and open
      questions from the brief

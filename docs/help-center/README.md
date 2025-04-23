# Help Center: Product documentation writing guide

This is a guide for writing [Help Center](https://operately.com/help),
product documentation for Operately, the open source B2B web app that unifies goal tracking, project and process management.

## Framework

This section of the website is built with [Starlight](https://starlight.astro.build/), Astro's documentation framework.

Content is stored in `src/content/docs/help`.

## File naming conventions

**All pages are in root**. Help center pages are stored in a single directory. We chose this approach over subdirectories to avoid URL maintenance and redirect complexity as the documentation evolves and gets reorganized.

Sections and pages are defined in `src/config/helpCenter.js`.

**Use descriptive, action-oriented filenames**. Follow these principles when naming new help pages:

- Start with an action verb that describes what the user wants to do

  - Good: `add-space-member`, `remove-space-member`
  - Avoid: `space-member-add`, `member-management`

- Make names descriptive and specific

  - Good: `reassign-space-manager-to-member`
  - Avoid: `change-role` or `reassign-manager`

- Skip articles ('a', 'the') in filenames

  - Good: `create-space`, `remove-member`
  - Avoid: `create-a-space`, `remove-the-member`

- Use hyphens to separate words

  - Good: `make-space-private`
  - Avoid: `makespacePrivate` or `make_space_private`

- Keep names concise but clear, not every word from the title needs to appear in the path
  - Good: `promote-to-space-manager`
  - Avoid: `change-space-member-role-to-space-manager-role`

The goal is to make filenames intuitive and searchable without enforcing rigid prefixes or complex naming rules.

## Writing guidelines

**Use simple, clear language**. Write in a conversational tone that's easy to understand.

**Avoid corporate speak, technical jargon, and buzzwords**. Operately is used by people without technical knowledge, with different backgrounds and expertise. Focus on practical benefits and everyday language.

**Be concise**. Each page should cover one task with clear steps.

**Use short sentences**. Keep paragraphs short and focused. Each paragraph should cover one idea.

## Page structure

### General guidelines

- Follow the automatically inserted page title with a short introductory paragraph. Do not start the page content with another header.
- Do not write "Related pages" section at the bottom of pages.

### Pages with screenshots

- Should have the `.mdx` extension.
- Should import and use the `<ImageEnhancer />` component.
- Unless they are referencing images from another page, they should be created as `index.md` inside a directory named after the path defined in `src/config/helpCenter.js`. Browse existing files to observe the structure.

### Outlining steps

Use Starlight's [`<Steps />`](https://starlight.astro.build/components/steps/) component to outline the steps in the page.

## How to create screenshots

Install the following tools to create high-quality screenshots for the help center:

- [Cleanshot X](https://www.cleanshot.com/) ($29 one-time payment)
- [Window Resizer](https://chromewebstore.google.com/detail/window-resizer/kkelicaakdanhinjdeammmilcgefonfh) (free)

When taking screenshots, follow these guidelines:

1. Create a demo organization "Nexus Dynamics" and use it for all screenshots
2. Set your name to "John Cooper" in your profile settings
3. Set the window size to 1280x1100 pixels with Window Resizer
4. After taking a screenshot with Cleanshot X, press **⌘E** to open the edit screen. (You can also save the file and open it later.)
   1. Press **B** to add a background.
   2. Use the following settings:
      - Gradient: choose the second option (purple/pink)
      - Padding: 50
      - Corners: 2
   3. Save these settings as a preset for later use.

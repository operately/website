# Help Center: Product documentation writing guide

This is a guide for writing [Help Center](https://operately.com/help),
product documentation for Operately.

## File naming conventions

Help center pages are stored in a single directory with descriptive, action-oriented filenames.
We chose this approach over subdirectories to avoid URL maintenance and redirect complexity as the documentation evolves and gets reorganized.
Follow these principles when naming new help pages:

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

- Keep names concise but clear
  - Good: `promote-to-space-manager`
  - Avoid: `change-space-member-role-to-space-manager-role`

The goal is to make filenames intuitive and searchable without enforcing rigid prefixes or complex naming rules.

## How to create screenshots

Install the following tools to create high-quality screenshots for the help center:

- [Cleanshot X](https://www.cleanshot.com/) ($29 one-time payment)
- [Window Resizer](https://chromewebstore.google.com/detail/window-resizer/kkelicaakdanhinjdeammmilcgefonfh) (free)

When taking screenshots, follow these guidelines:

1. Create a demo organization "Nexus Dynamics" and use it for all screenshots
2. Set your name to "John Cooper" in your profile settings
2. Set the window size to 1280x1100 pixels with Window Resizer
3. After taking a screenshot with Cleanshot X, press **⌘E** to open the edit screen.
    1. Press **B** to add a background.
    2. Use the following settings:
        - Gradient: choose the second option (purple/pink)
        - Padding: 50
        - Corners: 2
    3. Save these settings as a preset for later use.

## Working with AI

We use [Claude](https://claude.ai) to assist with documentation writing in two main ways:

### 1. Creating new feature documentation

When documenting a new product feature for the first time, start with a rough draft to establish the key points and structure.
Use the following prompt to get high-quality initial content:

```markdown
I'm writing help documentation for Operately, an open source b2b web app that unifies goal tracking, project and process management. I need your help with writing a section about [topic].

Here's the screenshot of the UI and a rough draft/summary of what we need to cover:

[Draft/Summary]

Please help me refine this into clear, helpful documentation while keeping our established tone:

- Direct and conversational
- Focus on practical benefits
- Avoid corporate speak, technical jargon, buzzwords
- Use simple, clear language

[Attach relevant screenshot]
```

#### Example of a manually written draft

Here's a specific example of a rough draft that Claude turned into
the initial version of the _Introduction to Spaces_ page.
[See final content in the pull request](https://github.com/operately/website/pull/115/files#diff-7a2269771601e2ad3a2cfd41cac852f8a28887c9e47b4fd18937ced0cc590808).

**When writing the draft, do not worry about the grammar or "quality"**.
Just write to communicate key ideas and set the basic structure to the content.

In the example below, notice how many things are left undefined and how the
quality of writing in the last few paragraphs drops:

> Spaces organize work for groups that share common goals and projects.
>
> For startups, we recommend creating a space for every department or distinct area of responsibility, such as:
>
> - Customer Success
> - Customer Support
> - Engineering
> - Executive
> - Finance
> - Legal
> - Marketing
> - People
> - Product
> - Sales
>
> Larger companies would need to create additional spaces for more fine-grained areas of work that reflect the org chart, such as (TODO: 2 examples).
>
> ### What's inside a space
>
> Each space is a home to:
>
> - Goals: (TODO: summarize in one sentence)
> - Projects: (TODO: summarize in one sentence)
> - Discussion board: (TODO: summarize in one sentence)
> - Documents & Files: (TODO: summarize in one sentence)
>
> ### The purpose of Company space
>
> The Company space is built-in and serves as a shared space for everyone. (TODO: expand a bit explaining how useful this is)
>
> ### Transparency by default, confidentiality is possible
>
> By default when you create a new space, everyone in the company can view and comment on resources and activities inside it.
>
> You can change this and for example make a space private with space access management tools.
>
> Unless you make a space private, there is no need to add someone to a space just for the sake of making things visible for them.
>
> ### Who to add to a space
>
> Members of the space should be people who are part of the corresponding group and actively contribute to corresponding work.
>
> Every member of the space will by default be notified when new goals, projects, messages, or documents are created in the space.

### 2. Iterating on existing documentation

For subsequent pages that follow established patterns (like how-to guides for similar features), you can work with AI more directly.
Simply describe what you need and reference existing similar pages - the AI will maintain consistency in style and structure while adapting the content for the new topic.

The purpose of passing screenshots to AI is to give it further context, not necessarily to add the screenshots to the final page.

#### Example of a prompt to create a simple how-to page

> Create page about the single use case of promoting somebody from a space manager to a regular space member. see how the option looks like [attach screenshot]

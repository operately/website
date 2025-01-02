# Help Center: Product documentation writing guide

This is a guide for writing [Help Center](https://operately.com/help),
product documentation for Operately.

## Tools for screenshots

- [Rectangle](https://rectangleapp.com/) (free) 
  - On a large screen, move the browser window to "Left Half" to take a screenshot of uniform width.
    - On macOS Sequoia, you can accomplish the same by holding the Option key and dragging the window to the side.
  - TODO: which specific setting works well for laptops?
- [Cleanshot X](https://www.cleanshot.com/) ($29 one-time payment)
  - After taking a screenshot, press **⌘E** to open the edit screen.
  - Press **B** to add background.
  - Use the following settings - save them as a preset for later:
    - Gradient: choose second option (purple/pink)
    - Padding: 50%
    - Corners: 2

## Use AI to produce well-written text from a rough draft

We use [Claude](https://claude.ai) to assist us with writing.

The process is simple: start with a rough draft of the page in Markdown.
Then ask Claude to turn it into a polished page.

### Prompt template

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

The purpose of passing a screenshot to AI is to give it further context, not necessarily to add the screenshot to the final page.

### Example of a manually written draft

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

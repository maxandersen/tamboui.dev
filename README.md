# tamboui.dev

This repository builds the `tamboui.dev` site using **Antora**.

## What you get

- **One Antora site** (landing pages + docs).
- **Docs are fetched from `tamboui/tamboui`** during the build (the build generates a small Antora wrapper inside a local clone).
- **Diagram support** is enabled via `asciidoctor-kroki` (Antora uses Asciidoctor.js).
- A shared **terminal + “jazz ink”** theme used across the whole site, with:
  - **Dark/light mode** toggle
  - Optional **terminal palette** selection

## Local development

Install dependencies:

```bash
npm install
```

Build the site:

```bash
npm run build
```

Serve locally:

```bash
npm run serve
```

The output is written to `build/site/`.

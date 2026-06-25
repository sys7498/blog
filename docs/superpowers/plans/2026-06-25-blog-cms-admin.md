# Blog CMS Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary combined post editor with a Git-backed admin CMS flow where writing starts from Posts and editing starts from a specific post.

**Architecture:** Add Decap CMS static admin files under `src/admin`, route authoring to `/admin`, and keep public Angular pages reader-focused. The public UI exposes icon+text author controls, but real write protection comes from GitHub authentication and repository write permissions in Decap CMS.

**Tech Stack:** Angular standalone components, Decap CMS CDN bundle, GitHub backend configuration, existing Markdown posts in `src/assets/posts`.

---

### Task 1: Add Decap CMS Admin Files

**Files:**
- Create: `src/admin/index.html`
- Create: `src/admin/config.yml`
- Modify: `angular.json`

- [ ] **Step 1: Add the admin shell**

Create `src/admin/index.html` with Decap CMS loaded from CDN:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yoonseok Shin CMS</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.8.0/dist/decap-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Add the Decap config**

Create `src/admin/config.yml` configured for GitHub, the `main` branch, and Markdown posts:

```yaml
backend:
  name: github
  repo: sys7498/blog
  branch: main

media_folder: "src/assets/posts/media"
public_folder: "/assets/posts/media"

collections:
  - name: "posts"
    label: "Posts"
    label_singular: "Post"
    folder: "src/assets/posts"
    create: true
    slug: "{{slug}}"
    extension: "md"
    format: "frontmatter"
    editor:
      preview: true
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "string", hint: "Use YYYY.MM.DD to match the current site." }
      - { label: "Summary", name: "summary", widget: "string", required: false }
      - { label: "Body", name: "body", widget: "markdown" }
```

- [ ] **Step 3: Include admin files in Angular assets**

Modify `angular.json` so `src/admin` is copied to `/admin` in the production build:

```json
{
  "glob": "**/*",
  "input": "src/admin",
  "output": "/admin"
}
```

### Task 2: Replace Public Write/Edit UX

**Files:**
- Modify: `src/app/body/blog-page/blog-page.component.html`
- Modify: `src/app/body/blog-page/blog-page.component.scss`
- Modify: `src/app/body/blog-page/blog-page.component.ts`
- Modify: `src/app/body/post-page/post-detail/post-detail.component.html`
- Modify: `src/app/body/post-page/post-detail/post-detail.component.scss`
- Modify: `src/app/body/post-page/post-detail/post-detail.component.ts`
- Modify: `src/app/app.routes.ts`

- [ ] **Step 1: Change Posts action from Write/Edit to Write**

Use an icon+text link/button that opens `/admin/#/collections/posts/new`.

- [ ] **Step 2: Add Edit only on the post detail page**

Use an icon+text link/button that opens `/admin/#/collections/posts/entries/{slug}` for the current post.

- [ ] **Step 3: Remove the temporary `/editor` Angular route**

Delete the route import and route entry for `PostEditorComponent`. Leave the files only if the build still references them nowhere, then remove the component directory.

### Task 3: Verify

**Files:**
- No new files.

- [ ] **Step 1: Build**

Run:

```bash
npm run build
```

Expected: build succeeds. Existing CommonJS warnings may remain.

- [ ] **Step 2: Inspect generated admin files**

Run:

```bash
test -f dist/blog/browser/admin/index.html && test -f dist/blog/browser/admin/config.yml
```

Expected: exit code 0.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add .
git commit -m "Add Git-backed blog CMS"
git push origin main
```

Expected: Vercel deployment starts from the pushed `main` commit.

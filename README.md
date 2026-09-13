# Yoonseok Shin — Research blog

Angular 20. Use Node.js 22.12+ and `npm ci`, then `npm start` or `npm run build`.

## Publications

`src/assets/publications.bib` is shared by the homepage, publications page and generated CV.
Edit `category = {paper}`, `{demo-poster}`, or `{unclassified}` to control the grouping.
The SIGGRAPH Asia 2025 XR contribution is a demo, so it belongs to `demo-poster`.
`image`, `award`, and links can be curated in the same entry.

### Free automatic updates

The `Sync publications` GitHub Actions workflow runs every Monday at approximately 09:23 KST
(and can be run from Actions → Sync publications → Run workflow).
It uses the public Crossref API with ORCID `0009-0004-4164-9559`, without a paid service or API key.
The repository is public, so its standard GitHub-hosted Actions runner is free.

This is **Crossref synchronization, not Google Scholar synchronization**: Scholar-only works,
preprints, and records without the author's ORCID in Crossref can be missing. Keep the Scholar
profile link for the broader list. Add missing BibTeX entries manually when necessary.

Run locally with `npm run sync:publications` (Python 3 required). The sync:

- Imports only works whose author has both the expected ORCID and Yoonseok Shin's name.
- Deduplicates by DOI (case-insensitive) or normalized title.
- Appends new entries without replacing existing metadata, thumbnails, awards, or category corrections.
- Labels new journal articles as papers; other new works go to **Other Publications** until categorized manually.
- Retains the bibliography on network or validation failure and marks the workflow failed.
- Commits and pushes only if new publications were added. Vercel's Git integration then handles deployment.

The sync is separate from the build: a Crossref outage does not block normal site deployments.
GitHub can disable scheduled workflows after 60 days of repository inactivity; re-enable the
workflow in Actions if that happens. Branch protections that forbid direct bot pushes require
adjusting the workflow to the repository's policy.

Validation: `python3 -m unittest discover -s scripts -p 'test_*.py'` and `npm run build`.

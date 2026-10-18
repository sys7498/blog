# Cooking preview import record

The source of truth is `src/data/cooking.json`. The homepage reads its `posts`
array directly, so new entries automatically join the hover slideshow.

Each entry records the Instagram shortcode (stable post identifier), caption,
permalink, and local representative photo. `lastImportedOn` is the import date,
not the Instagram publication date. Photos are served locally because Instagram
CDN URLs expire.

## Current coverage

- Checked on 2026-10-19 after the owner's archive changes: all 64 currently
  visible photo posts, one representative image per post. Carousel secondary
  slides are not imported.
- Newest imported post: `DeZb4lmuOhn` (물냉면).
- Oldest currently visible post: `CulJqBLhV_h`.
- Seven previously imported posts disappeared from the profile. They are recorded
  in `docs/cooking-retired.json`, outside the site's public assets and app imports.
  Their photos were removed from deployed assets; Git history retains recovery.
- Files remaining in Downloads are not considered imported. Only manifest entries
  with an existing local image count as imported.

## Next requested update

1. Read the manifest and collect its `shortcode` values before downloading.
2. Read the profile's post links and compare each shortcode against that set.
   Skip existing shortcodes whose local images exist. Repair a missing file
   without adding a duplicate entry.
   Load the complete grid, including reel covers, and verify the collected count
   matches the profile count before treating any missing entry as unpublished.
   Move no-longer-visible entries into `docs/cooking-retired.json` and remove
   their image assets. If a retired ID becomes visible again, restore its record
   and photo rather than duplicating it. Never infer removals from a partial load.
3. Download one representative photo for each new post. Name new files with the
   shortcode (for example `DeZb4lmuOhn.jpg`) to make future matching unambiguous.
   Keep existing filenames to preserve the recorded mappings.
4. Resize photos to at most 420px, then add the shortcode, caption, permalink,
   and local image path to the manifest in newest-first order. Update the import
   date only after successful imports. Never keep expiring CDN query URLs.
5. Verify unique shortcodes and image paths, check every image exists, build,
   and verify the preview before pushing/deploying.

`scripts/import-cooking.mjs` imports browser-exported `pageAssets` bundles using
rows of `shortcode|source filename prefix|caption|optional reel`. It skips existing
post IDs with a local file, saves new images by shortcode, resizes to 420px, and
records the import date. Use the same existing-ID check **before exporting assets**
from the browser too, so repeat updates do not download imported photos again.
Retain source filenames in new records; do not store expiring CDN URLs.

Do not use the newest imported post as a hard cutoff: earlier posts can still be
missing. This record supports manual updates on request; it is not an automatic
Instagram sync.

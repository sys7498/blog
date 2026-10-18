# Cooking preview import record

The source of truth is `src/data/cooking.json`. The homepage reads its `posts`
array directly, so new entries automatically join the hover slideshow.

Each entry records the Instagram shortcode (stable post identifier), caption,
permalink, and local representative photo. `lastImportedOn` is the import date,
not the Instagram publication date. Photos are served locally because Instagram
CDN URLs expire.

## Current coverage

- Imported on 2026-10-19: 12 representative photos, one per listed post.
- Newest imported post: `DeZblddOZH-` (소갈비수육).
- Oldest imported post: `DQw3hw3E-1j` (카레파스타).
- This is not a complete archive of the 71 posts seen on the account.
- `DeZb4lmuOhn` (물냉면), seen above the newest imported post, has not been imported.
- Files remaining in Downloads are not considered imported. Only manifest entries
  with an existing local image count as imported.

## Next requested update

1. Read the manifest and collect its `shortcode` values before downloading.
2. Read the profile's post links and compare each shortcode against that set.
   Skip existing shortcodes whose local images exist. Repair a missing file
   without adding a duplicate entry.
3. Download one representative photo for each new post. Name new files with the
   shortcode (for example `DeZb4lmuOhn.jpg`) to make future matching unambiguous.
   Keep existing filenames to preserve the recorded mappings.
4. Resize photos to at most 420px, then add the shortcode, caption, permalink,
   and local image path to the manifest in newest-first order. Update the import
   date only after successful imports. Never keep expiring CDN query URLs.
5. Verify unique shortcodes and image paths, check every image exists, build,
   and verify the preview before pushing/deploying.

Do not use the newest imported post as a hard cutoff: earlier posts can still be
missing. This record supports manual updates on request; it is not an automatic
Instagram sync.

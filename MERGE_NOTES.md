# Merge Notes — keep upstream al-folio merges painless

This site started from a clean upstream `alshedivat/al-folio` checkout and was
overlaid with personal content from the prior `jonathan-hunter.github.io` fork.
The customizations below are deliberately structured so that future merges from
upstream rarely touch theme machinery.

## Files that are **user-owned** (safe to keep, never overwritten by upstream)

| Path | Notes |
|------|-------|
| `_pages/about.md` `_pages/cv.md` `_pages/news.md` `_pages/publications.md` `_pages/repositories.md` `_pages/404.md` | Personal page content. The mass-spectrum banner HTML + `<script>` tag live in `about.md`. |
| `_news/announcement_*.md` | Personal announcements. |
| `_bibliography/papers.bib` | Personal BibTeX. |
| `_data/socials.yml` `_data/coauthors.yml` `_data/repositories.yml` `_data/venues.yml` `_data/cv_header.yml` | Personal data. |
| `assets/img/`, `assets/pdf/`, `assets/json/` | Personal images, PDFs (CV, thesis), JSON-resume. |
| `_sass/_custom.scss` | All custom global CSS overrides. |
| `_sass/_mass-spectrum-styles.scss` | Styles for the about-page spectrum banner. |
| `assets/js/mass-spectrum-background.js` | Spectrum animation. |

## Files that **must stay in sync with upstream** (do not edit directly)

`_layouts/`, `_includes/`, `_plugins/`, `_sass/_*` (other than the two
user-owned ones above), `assets/css/main.scss` (one user-added block, see
below), `assets/js/*` (other than `mass-spectrum-background.js`), `Gemfile`,
`Dockerfile`, `docker-compose*.yml`, `.github/workflows/`, `bin/`,
`purgecss.config.js`, `package.json`.

If a personal tweak ever feels like it requires editing one of those files,
first ask whether it can live in `_sass/_custom.scss`, `_pages/*.md`, or a new
file under `assets/`.

## The one deliberate edit in a theme-owned file

`assets/css/main.scss` ends with:

```scss
// User-owned overrides (keep last so they win over theme styles).
@use "custom";
@use "mass-spectrum-styles";
```

If upstream rewrites `main.scss`, just re-append those three lines after
merging.

## `_config.yml` — narrow set of personal overrides

Only these fields differ from upstream defaults:

- `first_name`, `middle_name`, `last_name`
- `description`, `footer_text` (Unsplash credit removed)
- `url`, `baseurl`
- `scholar.last_name`, `scholar.first_name`
- `external_sources:` commented out (was upstream example data)

Everything else (plugins, library versions, feature flags, collections) is left
as upstream ships it. When pulling upstream, accept their `_config.yml`
wholesale, then re-apply just the fields above.

## Pulling future upstream updates

Recommended flow (run from this repo, not from the old fork):

```bash
git remote add upstream https://github.com/alshedivat/al-folio.git    # one-time
git fetch upstream
git checkout -b sync/upstream-$(date +%Y-%m-%d)
git merge upstream/main
# Resolve any conflicts — they should be concentrated in _config.yml; reapply
# the ~6 fields listed above, then accept upstream for everything else.
bundle exec jekyll build      # sanity check
```

If the merge touches `assets/css/main.scss`, re-add the `@use "custom"` /
`@use "mass-spectrum-styles"` lines at the bottom.

## What was intentionally **dropped** from the previous fork

These customizations were folded back into the upstream defaults to remove
ongoing merge friction:

- **Forced dark mode** (`display: none` on the toggle): removed. Light/dark
  switching is now restored.
- **Custom `_includes/social.liquid`** that replaced the `jekyll-socials`
  plugin: removed. We use upstream's `{% social_links %}` plugin tag again.
- **Custom `_plugins/cache-bust.rb`**: removed. Upstream supplies the
  `jekyll-cache-bust` gem.
- **Modified `_layouts/about.liquid`** (one-line social tag swap): reverted.
- **Modified `_layouts/default.liquid` and `_includes/scripts.liquid`** that
  embedded the mass-spectrum banner: reverted. The banner now lives in
  `_pages/about.md` (HTML block + `<script>` tag), so no theme file is edited.

## Quick verification after a future merge

```bash
bundle exec jekyll build                              # should complete clean
grep -c "toggle-container" _site/index.html           # >0 = dark-mode toggle visible
grep -c "mass-spectrum"  _site/index.html             # >0 = spectrum banner present
grep -c "prof_pic_color" _site/index.html             # >0 = profile pic wired
```

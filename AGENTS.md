# Agent Guidelines for jonathan-hunter.github.io

Personal academic site of Jonathan E. Hunter, built on the
[al-folio](https://github.com/alshedivat/al-folio) Jekyll theme and deployed
to `https://jonathan-hunter.github.io` (root site, empty `baseurl`).

## Read This First: This Fork vs Upstream

- **Pinned to pre-v1 al-folio.** The fork's base is upstream commit `afee5a7` (2026-05-01, v0.16.x). Upstream v1.0+ moved layouts, includes, Sass and plugins into `al_*` gems. Current upstream docs, issues and `docs/BOUNDARIES.md` therefore describe a different architecture. Never `git merge upstream/main`; see [MERGE_NOTES.md](MERGE_NOTES.md).
- **[MERGE_NOTES.md](MERGE_NOTES.md) is the record of every customisation.** It lists each user-owned file, each edited theme file and each `_config.yml` override. Any change that touches a theme-owned file (`_layouts/`, `_includes/`, `_sass/`, `_plugins/`, `assets/js/`, `assets/css/main.scss`, workflows) or adds a `_config.yml` key **must update MERGE_NOTES.md in the same commit**.
- **Where customisations go:**
  - Styles go in `_sass/_custom.scss`; the spectrum styles go in `_sass/_mass-spectrum-styles.scss`.
  - New markup goes in a new `_includes/jeh_*.liquid` include rather than inline in a theme file.
  - Custom CSS classes use the `jeh-` prefix (BEM-style: `jeh-hero__name`).
  - Edit a theme file only to wire in a `jeh_*` include or a front-matter switch.
- **Spectrum canvases:** any `<canvas class="mass-spectrum-canvas" data-variant="hero|divider-stems-fade">` is drawn by `assets/js/mass-spectrum-background.js`, which is loaded site-wide from `scripts.liquid`.
- **CV:** `/cv/` is hand-written Markdown in `_pages/cv.md`. `_layouts/cv.liquid`, `_includes/resume/`, `_includes/cv/` and `_data/cv.yml` (still upstream placeholder data) are **not rendered**. Do not edit them expecting a change on the site.
- **Generated data:** `_data/citations.yml` is rewritten by `.github/workflows/update-citations.yml` (Monday, Wednesday, Friday). Never hand-edit it. `scholar_userid` lives in `_data/socials.yml`.
- **Locale:** UK English spelling in content and comments; dates in front matter use ISO 8601 (`YYYY-MM-DD`).

## Quick Links by Role

- **Are you a coding agent?** → Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) first (tech stack, build, CI/CD, common pitfalls & solutions)
- **Customizing the site?** → See [`.github/agents/customize.agent.md`](.github/agents/customize.agent.md)
- **Writing documentation?** → See [`.github/agents/docs.agent.md`](.github/agents/docs.agent.md)
- **Need setup/deployment help?** → [INSTALL.md](INSTALL.md)
- **Troubleshooting & FAQ?** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Customization & theming?** → [CUSTOMIZE.md](CUSTOMIZE.md)
- **Quick 5-min start?** → [QUICKSTART.md](QUICKSTART.md)

## Essential Commands

### Local Development (Docker)

The recommended approach on a workstation is Docker. In the dev container or a
cloud agent session, where Docker may be unavailable, build with Bundler
instead (`bundle install` once, then `bundle exec jekyll build`).

```bash
# Initial setup & start dev server
docker compose pull && docker compose up
# Site runs at http://localhost:8080

# Rebuild after changing dependencies or Dockerfile
docker compose up --build

# Stop containers and free port 8080
docker compose down
```

### Pre-Commit Checklist

Before every commit, you **must** run these steps:

1.  **Format Code:**
    ```bash
    # (First time only)
    npm install --save-dev prettier @shopify/prettier-plugin-liquid
    # Format all files
    npx prettier . --write
    ```
2.  **Build Locally & Verify:**

    ```bash
    # Rebuild the site
    docker compose up --build

    # Verify by visiting http://localhost:8080.
    # Check navigation, pages, images, and dark mode.

    # Without Docker: build, then run the checks in MERGE_NOTES.md
    # ("Quick verification after touching theme files").
    bundle exec jekyll build
    ```

3.  **Keep MERGE_NOTES.md current** if the commit touches a theme-owned file or `_config.yml` (see above).

## Critical Configuration

When modifying `_config.yml`, these **must be updated together**:

- **This site:** `url: https://jonathan-hunter.github.io` + `baseurl:` (empty). Do not change either.
- **YAML errors:** Quote strings with special characters: `title: "My: Cool Site"`

## Development Workflow

- **Git & Commits:** For commit message format and Git practices, see [.github/GIT_WORKFLOW.md](.github/GIT_WORKFLOW.md).
- **Code-Specific Instructions:** Consult the relevant instruction file for your code type.

| File Type                                     | Instruction File                                                                                |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Markdown content (`_posts/`, `_pages/`, etc.) | [markdown-content.instructions.md](.github/instructions/markdown-content.instructions.md)       |
| YAML config (`_config.yml`, `_data/`)         | [yaml-configuration.instructions.md](.github/instructions/yaml-configuration.instructions.md)   |
| BibTeX (`_bibliography/`)                     | [bibtex-bibliography.instructions.md](.github/instructions/bibtex-bibliography.instructions.md) |
| Liquid templates (`_includes/`, `_layouts/`)  | [liquid-templates.instructions.md](.github/instructions/liquid-templates.instructions.md)       |
| JavaScript (`_scripts/`)                      | [javascript-scripts.instructions.md](.github/instructions/javascript-scripts.instructions.md)   |

## Common Issues

For troubleshooting, see:

- [Common Pitfalls & Workarounds](.github/copilot-instructions.md#common-pitfalls--workarounds) in copilot-instructions.md
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions
- [GitHub Issues](https://github.com/alshedivat/al-folio/issues) to search for your specific problem. Upstream issues filed after 2026-05-25 generally concern v1.x and may not apply here.

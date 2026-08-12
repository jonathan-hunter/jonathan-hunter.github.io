# .devcontainer

This project is a "spoke": it builds the container from the `dev-env` hub in a
sibling checkout (`<parent>/dev-env` next to `<parent>/jonathan-hunter.github.io`).
Nothing here duplicates the hub — the Dockerfile, firewall script and Claude
settings all live there, and hub edits reach this project on its next container
rebuild.

- `devcontainer.json` — the per-project surface: build args, features, mounts,
  ports, colours. All hub paths assume the sibling layout.
- `extra-domains.txt` — extra firewall allowlist entries, one domain per line,
  read at firewall apply time from the read-only `.devcontainer` mount.

The spoke's own `.claude/worktrees/` directory is a required bind-mount source —
`initializeCommand` creates it on the host before the mounts are evaluated, so a
fresh checkout starts cleanly.

## Jekyll additions

The hub image is Node + Python; al-folio needs a Ruby toolchain on top. Rather
than fork the hub Dockerfile, everything is layered on from this file:

- **`features`** — `apt-packages` installs ImageMagick (jekyll-imagemagick;
  responsive images are enabled in `_config.yml`), inotify-tools (al-folio's
  config-watch restart loop) and the headers native gems need at build time.
  `ruby` installs the interpreter via rvm. `overrideFeatureInstallOrder` puts
  the apt layer first so the Ruby build has its dependencies.
- **`containerEnv`** — `GEM_HOME`/`BUNDLE_PATH` put gems in a node-owned dir
  outside the workspace, so installs stay off the slow macOS bind mount and
  cannot leave root-owned artefacts in the checkout. They are *not* on a named
  volume: Docker creates a volume mount point as root, and the container user
  has sudo rights for `init-firewall.sh` only, so nothing could chown it. The
  trade-off is that `bundle install` re-runs on each container create.
- **`postCreateCommand`** — installs bundler and nbconvert after the hub's
  `post-create.sh` has applied the firewall. Project gems are deliberately not
  installed automatically; run `bundle install` when you trust the tree.
- **nbconvert** lives in a plain venv rather than `uv tool install`, because
  jekyll-jupyter-notebook shells out to `jupyter nbconvert` and needs both
  `jupyter` (from jupyter-core) and `jupyter-nbconvert` on PATH — `uv tool`
  only links the primary package's scripts.

## Ports

`forwardPorts`, not `appPort`. VS Code's forwarding runs a helper *inside* the
container that connects over loopback, which the firewall's INPUT chain already
permits. Publishing the port with `appPort` would route host → bridge → eth0 and
hit the chain's `REJECT`, which cannot be fixed from this file — the container
user may only sudo `init-firewall.sh`, so no rule can be added at runtime.

The practical cost: **8080 is reachable only while VS Code is attached.** If you
need it published for a CLI-launched container or another host app, the hub's
`init-firewall.sh` needs an INPUT accept rule for 8080/35729, and that is a hub
edit affecting every spoke.

Serve with `bundle exec jekyll serve --livereload --force_polling` —
`--force_polling` because file watching over a bind mount is unreliable on macOS.
Stop any host-side `docker compose up` first; both want 8080.

## Known-fragile

- **rvm's PATH.** The Ruby feature exports PATH via `/etc/profile.d/*.sh`, which
  zsh does not read, so `containerEnv.PATH` pins it explicitly. Both
  `rubies/default/bin` and `wrappers/default` are listed because which one rvm
  populates depends on how the feature sets its default; a non-existent PATH
  entry is harmless. Verify with `docker exec <container> ruby -v`, not just an
  interactive terminal — a login shell can find Ruby when subprocesses cannot.
- **`version: "3.4"`** relies on rvm resolving the series to its latest patch.
  If the feature rejects it, pin a full version (`3.4.5`) and update the PATH
  entry to match if `rubies/default` turns out not to be a symlink.
- **rubygems.org is Fastly-backed.** The firewall resolves it to fixed IPs at
  container start, so a long-lived container can see `bundle install` begin to
  fail as IPs rotate. Re-run `sudo /usr/local/bin/init-firewall.sh` to
  re-resolve.

The site build itself needs no network: `third_party_libraries.download` is
`false` in `_config.yml`, so CDN assets are referenced with SRI hashes and
fetched by the browser on the host, not the container.

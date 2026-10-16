# Patched stable fork

[简体中文](fork-maintenance.zh-CN.md)

This fork preserves TW → 🇹🇼 in country rules, shared country displays, backend
node renaming and bundled Clash/Surge templates. Existing saved templates and
node names are not rewritten. Edit saved templates in the UI if they contain
`🇨🇳 台湾节点`, replacing group names and all references with `🇹🇼 台湾节点`.

## Branches and Actions

- `stable` is the default branch, initially based on upstream `v1.2.20`.
  The original `main` is retained; deploy releases from `stable`.
- `.github/upstream-version` records the incorporated upstream release.
- **Fork Build and Release** runs frontend flag regression tests, ESLint,
  the production frontend build, Go formatting, golangci-lint, all Go tests and
  a Linux amd64 production build. Each build uploads a workflow artifact.
- Tags such as `v1.2.20-tw.1` publish a GitHub Release with
  `sublinkPro-linux-amd64` and `SHA256SUMS`. The tag must match the recorded
  upstream version. The full fork tag is embedded as the program version.
- **Fork Sync Upstream Stable** checks the latest upstream non-prerelease daily
  at 03:23 UTC and supports manual runs. It merges the upstream tag on a separate
  branch, then opens/updates a PR to `stable`. It explicitly dispatches the build:
  `GITHUB_TOKEN` pushes/PRs do not trigger normal push/PR workflows. No personal
  token or server SSH key is required.
- Merge conflicts stop the sync and list conflicting files in the Actions
  summary. Resolve locally and validate before merging. Review new upstream
  flag code as well as the regression results.
- Merging an update PR builds an artifact. Release publishing requires an
  explicit tag push. No workflow deploys to the server.

Enable Actions and allow Actions to create pull requests in repository settings.
Set `stable` as the default branch so scheduled workflows run. Disable inherited
**Build and Release Multi-Platform** and **PR Checks** workflows in Actions
settings. Their entry jobs are also restricted to the upstream repository.
Their files remain for upstream merges; fork workflows provide checks
and publishing without Docker Hub credentials. Review newly added upstream
workflow files when merging update PRs.

After reviewing/merging an update, publish from the up-to-date branch:

```bash
git switch stable
git pull --ff-only origin stable
git tag v1.2.20-tw.2   # use the matching upstream version + next fork revision
git push origin v1.2.20-tw.2
```

## Existing systemd deployment

Keep `/opt/sublinkpro/sublinkPro`, `/etc/systemd/system/sublinkpro.service`,
`/etc/sublinkpro.env` and `/var/lib/sublinkpro`. The server needs no Go/Node
toolchain. Download a specific release, run `sha256sum -c SHA256SUMS`, and set
the binary executable before installation. The frontend is embedded.

Stop `sublinkpro`, back up both the old executable and the entire
`/var/lib/sublinkpro` directory, install the verified binary and start the service.
Check `systemctl is-active sublinkpro`, startup logs and public
`GET /api/v1/version`. Verify TW displays 🇹🇼 and generated names use 🇹🇼.
Hard-refresh the browser if old frontend assets are cached.

On failure, stop the service and restore both the old executable and its matching
data snapshot before restarting. Upstream upgrades may migrate the database;
reverting the executable alone is not a reliable rollback. Keep backups private
because data/configuration contain credentials. Avoid the upstream updater,
which would overwrite this fork's binary with an official build.

## Local validation and build

Use Go from `go.mod`, Node 24 and Yarn from `webs/package.json` through Corepack:

```bash
node --test scripts/tests/country-flags.test.mjs
(cd webs && yarn install --immutable && yarn run lint && yarn run build)
golangci-lint run
go test ./...
cp -a webs/dist static
printf '%s\n' v1.2.20-tw.1 > VERSION
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -tags=prod -ldflags='-s -w' -o sublink .
git restore VERSION
```

# Release Process Migration

This project has been migrated from semantic-release to release-please.

## How Release Please Works

Release Please automates the release process by:

1. **Creating Release PRs**: When commits are pushed to `master`, release-please analyzes the commit messages (using Conventional Commits) and creates/updates a Release PR with:
   - Version bumps based on commit types (feat = minor, fix = patch, breaking change = major)
   - Updated CHANGELOG.md files
   - Updated package.json versions

2. **Publishing**: When the Release PR is merged, release-please:
   - Creates GitHub releases with release notes
   - Tags the releases
   - Triggers the npm publish workflow

## Configuration Files

- **release-please-config.json**: Main configuration defining all packages in the monorepo
- **.release-please-manifest.json**: Tracks current versions of all packages

## Workflow Changes

The publish workflow now has two jobs:

1. **release-please**: Creates/updates the release PR
2. **publish-npm**: Only runs when a release PR is merged (when `releases_created` is true)

## Commit Message Format

Continue using Conventional Commits as before:

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking changes (major version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `build:`, `ci:` - No version bump

## Manual Release

If you need to trigger a release manually, you can:

1. Push commits with conventional commit messages
2. Wait for release-please to create/update the Release PR
3. Review and merge the Release PR
4. The packages will be automatically published to npm

## Notes

- The `release` script has been removed from all package.json files
- All `.releaserc.cjs` files have been removed
- Release-please handles the entire release process via GitHub Actions

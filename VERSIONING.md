# Versioning Guide

## Quick Reference

| Action | Command | Result |
|--------|---------|--------|
| **Patch** (bug fixes) | Merge PR to main | 0.0.1 → 0.0.2 |
| **Minor** (new features) | `git tag bump-minor && git push origin bump-minor` | 0.1.0 → 0.2.0 |
| **Major** (breaking changes) | `git tag bump-major && git push origin bump-major` | 1.0.0 → 2.0.0 |

## Automated Workflow

### 1. Patch Updates (Automatic)
- **Trigger**: PR merged to main branch
- **Action**: Patch version increment (0.0.1 → 0.0.2)
- **Release**: Creates "latest" release automatically
- **Use case**: Bug fixes, small improvements

### 2. Minor Updates (Manual)
```bash
# When ready for minor version bump
git tag bump-minor
git push origin bump-minor
```
- **Action**: Minor version increment with patch reset (0.1.5 → 0.2.0)
- **Release**: Creates tagged release
- **Use case**: New features, backwards compatible

### 3. Major Updates (Manual)
```bash
# When ready for major version bump  
git tag bump-major
git push origin bump-major
```
- **Action**: Major version increment with minor/patch reset (1.5.3 → 2.0.0)
- **Release**: Creates stable tagged release
- **Use case**: Breaking changes, major milestones

## Release Channels

### 🎯 Stable (`stable`)
- **Versions**: Only major.minor.0 (1.0.0, 1.1.0, 2.0.0, 2.1.0, etc.)
- **Content**: Production-ready releases with new features
- **Excludes**: Patch releases (1.0.1, 1.0.2, etc.)
- **Use Case**: Production deployments, maximum stability
- **URL**: `https://github.com/andrewgari/foundryvtt-strongholds/releases/download/stable/module.json`

### 🚀 Latest (`latest`) 
- **Versions**: All released versions (x.x.x)
- **Content**: Most recent release with all features and fixes
- **Includes**: Major, minor, and patch releases  
- **Use Case**: Active development, want newest features and fixes
- **URL**: `https://github.com/andrewgari/foundryvtt-strongholds/releases/latest/download/module.json`

### ⚡ Snapshot (`snapshot`)
- **Versions**: Development builds from PRs and feature branches
- **Content**: Bleeding edge, unreleased features
- **Format**: `0.1.0-pr123.202508141430.abc1234` or `0.1.0-feature-branch.timestamp.hash`
- **Use Case**: Testing, development, preview upcoming features
- **URL**: `https://github.com/andrewgari/foundryvtt-strongholds/releases/download/snapshot/module.json`
- **⚠️ Warning**: Unstable, for development only!

## Examples

```bash
# Current version: 0.1.3

# 1. Fix a bug (patch) - just merge PR
# Result: 0.1.4 → Latest channel

# 2. Add new feature (minor)
git tag bump-minor && git push origin bump-minor  
# Result: 0.2.0 → Latest + Stable channels (major.minor.0)

# 3. Major rewrite (major)
git tag bump-major && git push origin bump-major
# Result: 1.0.0 → Latest + Stable channels (major.minor.0)

# 4. Create PR with new feature
# Result: 0.1.4-pr42.202508141430.abc123 → Snapshot channel

# 5. Work on feature branch  
# Result: 0.1.4-my-feature.202508141530.def456 → Snapshot channel
```

## Channel Updates

| Action | Stable | Latest | Snapshot |
|--------|--------|--------|----------|
| Merge PR to main | No change | ✅ Updated | No change |
| Tag minor version | ✅ Updated | ✅ Updated | No change |  
| Tag major version | ✅ Updated | ✅ Updated | No change |
| Push to PR | No change | No change | ✅ Updated |
| Push to feature branch | No change | No change | ✅ Updated |

## Behind the Scenes

1. **version-bump.yml**: Handles automatic patch increments on main
2. **version-update.yml**: Processes bump-major/bump-minor tags
3. **release.yml**: Creates GitHub releases with FoundryVTT packages
4. All workflows update module.json, package.json, and README.md automatically
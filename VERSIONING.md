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

### Latest Releases
- Auto-generated from main branch merges
- Always contains newest features
- Patch version increments
- Recommended for active development

### Stable Releases  
- Major versions only (x.0.0)
- Production-ready
- Creates additional `stable-vX` tag
- Recommended for production use

## Examples

```bash
# Current version: 0.1.3

# 1. Fix a bug (patch) - just merge PR
# Result: 0.1.4 (automatic)

# 2. Add new feature (minor)
git tag bump-minor && git push origin bump-minor
# Result: 0.2.0

# 3. Major rewrite (major)  
git tag bump-major && git push origin bump-major
# Result: 1.0.0 (marked as stable)
```

## Behind the Scenes

1. **version-bump.yml**: Handles automatic patch increments on main
2. **version-update.yml**: Processes bump-major/bump-minor tags
3. **release.yml**: Creates GitHub releases with FoundryVTT packages
4. All workflows update module.json, package.json, and README.md automatically
#!/bin/bash

# Strongholds & Followers Release Script
# Usage: ./scripts/release.sh [major|minor|patch]

set -e

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Error: Must be on main branch to create a release"
    exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --staged --quiet; then
    echo "Error: There are uncommitted changes"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(jq -r '.version' module.json)
echo "Current version: $CURRENT_VERSION"

# Parse version parts
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

# Determine new version based on argument
case "${1:-patch}" in
    major)
        NEW_VERSION="$((major + 1)).0.0"
        ;;
    minor)
        NEW_VERSION="$major.$((minor + 1)).0"
        ;;
    patch)
        NEW_VERSION="$major.$minor.$((patch + 1))"
        ;;
    *)
        echo "Usage: $0 [major|minor|patch]"
        exit 1
        ;;
esac

echo "New version will be: $NEW_VERSION"
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 1
fi

# Update version in files
jq --arg version "$NEW_VERSION" '.version = $version' module.json > tmp.json && mv tmp.json module.json
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" package.json

# Update README changelog
DATE=$(date +"%Y-%m-%d")
sed -i "/## Changelog/a\\
\\
### Version $NEW_VERSION ($DATE)\\
- Release version $NEW_VERSION" README.md

# Commit changes
git add module.json package.json README.md
git commit -m "chore: prepare release v$NEW_VERSION"

# Create and push tag
git tag "v$NEW_VERSION"
git push origin main
git push origin "v$NEW_VERSION"

echo "Release v$NEW_VERSION created and pushed!"
echo "GitHub Actions will automatically create the release and build artifacts."
echo ""
echo "Monitor the release at: https://github.com/andrewgari/strongholds-and-followers/actions"
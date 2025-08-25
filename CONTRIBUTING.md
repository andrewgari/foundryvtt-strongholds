# Contributing to Strongholds & Followers

Thank you for your interest in contributing to the Strongholds & Followers FoundryVTT module!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test in FoundryVTT
6. Submit a pull request

## Versioning

We use Semantic Versioning (SemVer):

- **Major** (x.0.0): Breaking changes, major new features
- **Minor** (0.x.0): New features, backwards compatible
- **Patch** (0.0.x): Bug fixes, minor improvements

### Automatic Versioning

- **Push to main**: Minor version bump (0.1.0 → 0.2.0)
- **Create release tag**: Major version (v1.0.0)
- **Feature branches**: Dev version with commit hash (0.1.0-dev.abc123)

## Adding Content from the PDF

When adding bonuses from the official Strongholds & Followers PDF:

1. Use the GM interface to add bonuses manually
2. Document the bonus source (page number, stronghold type, level)
3. Test that bonuses work correctly with D&D 5e characters
4. Consider both party-wide and class-specific applications

## Code Style

- Use ES6+ JavaScript features
- Follow existing code patterns
- Comment complex logic
- Use descriptive variable names
- Keep functions focused and small

## Testing

- Test all UI interactions work properly
- Verify data persistence across sessions
- Test with different user permission levels (GM vs Player)
- Ensure compatibility with D&D 5e system

## Pull Request Process

1. Update documentation if needed
2. Add/update tests for new features
3. Ensure CI passes
4. Request review from maintainers
5. Address any feedback

## Reporting Issues

When reporting bugs:

- Include FoundryVTT version
- Include D&D 5e system version
- Include module version
- Provide steps to reproduce
- Include relevant error messages

## Feature Requests

- Check existing issues first
- Clearly describe the feature
- Explain the use case
- Reference official Strongholds & Followers content when applicable

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

# Strongholds & Followers for FoundryVTT

A comprehensive FoundryVTT module for managing strongholds and their bonuses from the Strongholds & Followers supplement by MCDM Productions.

## Features

- **GM Stronghold Management**: Create, edit, and manage party strongholds
- **Player Viewing Interface**: Players can view active strongholds and their benefits
- **Automatic Bonus Application**: Stronghold bonuses are automatically applied during extended rests
- **Four Stronghold Types**: Temple, Keep, Tower, and Establishment
- **Class-Specific Bonuses**: Additional bonuses for characters matching the stronghold's class flavor
- **Scalable Levels**: Strongholds from level 1-20 with increasing benefits

## Installation

Choose your preferred release channel:

### 🚀 Latest Channel (Recommended)
*Most recent release with all features and fixes*
```
https://github.com/andrewgari/foundryvtt-strongholds/releases/latest/download/module.json
```

### 🎯 Stable Channel (Production)  
*Major.minor.0 versions only (1.0.0, 1.1.0, 2.0.0, etc.) - excludes patches*
```
https://github.com/andrewgari/foundryvtt-strongholds/releases/download/stable/module.json
```

### ⚡ Snapshot Channel (Development)
*Bleeding edge builds from PRs and feature branches - ⚠️ Unstable!*
```
https://github.com/andrewgari/foundryvtt-strongholds/releases/download/snapshot/module.json
```

### Installation Steps
1. In FoundryVTT, go to "Add-on Modules"
2. Click "Install Module"  
3. Paste your chosen manifest URL above
4. Click "Install" and enable in your world

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/andrewgari/foundryvtt-strongholds/releases)
2. Extract to your FoundryVTT `Data/modules/` directory
3. Enable the module in your world's module settings

## Usage

### For Game Masters
1. Click the castle icon in the scene controls to open the Stronghold Manager
2. Create new strongholds by specifying:
   - Name (e.g., "Sacred Grove Temple")
   - Type (Temple, Keep, Tower, Establishment)
   - Class Flavor (optional - provides class-specific bonuses)
   - Level (1-20)
3. Activate/deactivate strongholds as needed
4. View all available bonuses for each stronghold

### For Players
1. Click the "Strongholds" button in the player list to view active strongholds
2. See which bonuses apply to your character
3. Bonuses are automatically applied when taking extended rests (if enabled)

## Stronghold Types & Bonuses

### Temple
- **Base Bonuses**: Sacred ground advantages, divine protection, blessed recovery
- **Class Bonuses**: Extra benefits for Clerics and Paladins

### Keep
- **Base Bonuses**: Combat training, strategic advantages, fortified rest
- **Class Bonuses**: Extra benefits for Fighters and Paladins

### Tower
- **Base Bonuses**: Arcane studies, magical insight, spell focus
- **Class Bonuses**: Extra benefits for Wizards, Sorcerers, and Warlocks

### Establishment
- **Base Bonuses**: Social networks, trade connections, information gathering
- **Class Bonuses**: Extra benefits for Rogues and Bards

## Configuration

The module includes the following settings:
- **Automatically Apply Bonuses**: When enabled, players receive chat messages with applicable bonuses after extended rests

## Compatibility

- **Foundry VTT**: Version 13+ (required)
- **D&D 5e System**: Version 5.0.0+ (required dependency)
  - Character class detection
  - Automatic bonus application during extended rests
  - Level-based progression tracking
  - Enhanced chat message integration
- **Other Systems**: Limited functionality - system detection warnings will be displayed

## API

The module exposes the following API under `game.strongholds`:

```javascript
// Access stronghold data models
game.strongholds.StrongholdData

// Open manager (GM only)
new game.strongholds.StrongholdManager().render(true);

// Open viewer (players)
new game.strongholds.StrongholdViewer().render(true);
```

## Development

### Building
This module uses ES6 modules and modern JavaScript features. No build process is required.

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This module is licensed under the MIT License. The Strongholds & Followers content is property of MCDM Productions.

## Credits

- **Original Content**: MCDM Productions - Strongholds & Followers
- **Module Development**: Andrew Gari
- **FoundryVTT**: Foundry Gaming LLC

## Support

For issues and feature requests, please use the GitHub issue tracker.

## Development

### Versioning
This project uses [Semantic Versioning](https://semver.org/):
- **Major** (x.0.0): Breaking changes, major releases
- **Minor** (0.x.0): New features, backwards compatible  
- **Patch** (0.0.x): Bug fixes, minor improvements

### Automatic Versioning Workflow
- **Push to main branch**: Patch version auto-bump (0.0.1 → 0.0.2)
- **Create `bump-minor` tag**: Minor version update (0.1.0 → 0.2.0) 
- **Create `bump-major` tag**: Major version update (1.0.0 → 2.0.0)
- **Feature branches**: Development versions with commit hash (0.1.0-dev.abc123)

### Release Process
1. **Patch Updates**: Merge PR to main → auto-bump patch version (0.0.1 → 0.0.2)
2. **Minor Updates**: `git tag bump-minor && git push origin bump-minor`
3. **Major Updates**: `git tag bump-major && git push origin bump-major`
4. **FoundryVTT Integration**: All releases automatically available for update in Foundry

## Changelog

### Version 0.1.6
- Initial development release
- Core stronghold management system (Temple, Keep, Tower, Establishment)
- Level progression system (1-5) with upgrade costs
- Gold cost tracking and upgrade system
- Custom bonus management (ready for PDF content)
- GM management interface with create/edit/upgrade functions
- Player viewing interface
- **D&D 5e System Integration**:
  - Character class detection and matching
  - Automatic bonus application during extended rests
  - Enhanced chat messages with character context
  - System compatibility validation
- Persistent data storage
- GitHub Actions CI/CD pipeline with automatic versioning
- FoundryVTT auto-update integration
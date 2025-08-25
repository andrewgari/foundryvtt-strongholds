# Project Bible: Strongholds & Followers

This document serves as the single source of truth (“bible”) for AI agents and developers working on the Strongholds & Followers FoundryVTT module. It defines the project’s objectives, vision, architecture, and core components to ensure alignment and clarity.

## 1. Objectives

1. **Empower Game Masters**: Provide GMs with a robust interface to create, configure, and manage party strongholds (Temple, Keep, Tower, Establishment).
2. **Enhance Player Experience**: Enable players to view active strongholds and automatically receive thematic bonuses during extended rests.
3. **Automate Bonus Application**: Seamlessly deliver class‑specific and level‑based bonuses through D&D 5e system hooks.
4. **Maintain Extensibility**: Design with clear API and modular patterns so future features (new stronghold types, alternative systems) can be added easily.
5. **Follow Best Practices**: Adhere to FoundryVTT public API, security guidelines, and performance optimizations (debouncing, batch updates).

## 2. Vision

> “Strongholds & Followers should feel like a natural extension of D&D 5e: easy for GMs to manage infrastructures, engaging for players to explore strategic benefits, and invisible overhead to the core gameplay experience.”

## 3. Architecture Overview

```text
strongholds-and-followers/
├── module.json               # Manifest for Foundry registration and compatibility
├── scripts/
│   ├── main.js               # Initialization, hooks, settings, and API exposure
│   ├── stronghold-data.js    # Static data and business logic for stronghold types and costs
│   ├── stronghold-manager.js # GM Application (UI and data management)
│   └── stronghold-viewer.js  # Player Application (UI for viewing active strongholds)
├── templates/                # Handlebars templates for UI applications
├── styles/                   # CSS leveraging Foundry theme variables
├── lang/                     # Localization files
└── docs/                     # Documentation and this Project Bible
```

### 3.1 Core Components

- **StrongholdData**: Defines types, level costs, and bonus structures in a static class.
- **StrongholdManager**: Extends Legacy Application to allow GMs to create, activate, and upgrade strongholds.
- **StrongholdViewer**: Provides a read‑only interface for players to inspect active strongholds and bonuses.
- **main.js**: Registers settings, API (`game.strongholds.*`), Handlebars helpers, and hooks (scene controls, player list, D&D 5e rest hook).

## 4. Data Flow & Hooks

1. GM clicks scene-control button → `StrongholdManager.render(true)` → user input → `game.settings.set('strongholds', data)`
2. Player clicks player-list button → `StrongholdViewer.render(true)` → reads `game.settings.get('strongholds')`
3. On `dnd5e.restCompleted` (long rest) → if auto‑apply enabled, generates whispered chat message with applicable bonuses.

## 5. Extension Points

- **New Stronghold Types**: Add entries in `STRONGHOLD_TYPES` and `STRONGHOLD_COSTS`.
- **Additional Hooks**: Tie into other system events (e.g., short rest hooks, spell-casting hooks).
- **Alternate Systems**: Detect `game.system.id` and adapt property paths for different RPG systems.

## 6. Development & Maintenance

- Update this Project Bible when any core objective, vision statement, or architecture changes.
- Use it as the authoritative guide for code reviews and AI‑driven development tasks.

_Last updated: $(date +"%Y-%m-%d")._

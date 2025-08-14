# Strongholds & Followers - Development Patterns

> **Module-specific patterns** and best practices demonstrated in this FoundryVTT module.

## 🏛️ **Architecture Overview**

This module demonstrates several key FoundryVTT development patterns:

### **File Structure**
```
strongholds-and-followers/
├── module.json              # Manifest (follows v13 standards)
├── scripts/
│   ├── main.js             # Entry point with hooks and initialization
│   ├── stronghold-data.js  # Data models and business logic
│   ├── stronghold-manager.js # GM Application (Legacy Application class)
│   └── stronghold-viewer.js  # Player Application (Legacy Application class)
├── templates/              # Handlebars templates
├── styles/                 # CSS with Foundry variables
├── lang/                   # Internationalization
└── docs/                   # Development documentation
```

## 🔧 **Core Patterns Demonstrated**

### **0. D&D 5e System Integration** 
```json
// module.json - Declare system dependency
{
  "relationships": {
    "systems": [
      {
        "id": "dnd5e",
        "type": "system", 
        "manifest": "https://raw.githubusercontent.com/foundryvtt/dnd5e/master/system.json",
        "compatibility": {
          "minimum": "5.0.0",
          "verified": "5.1.0"
        }
      }
    ]
  }
}
```

### **1. Settings Management Pattern**
```javascript
// scripts/main.js
Hooks.once('init', async function() {
    // World-scoped data storage
    game.settings.register('strongholds-and-followers', 'strongholds', {
        name: 'Strongholds Data',
        hint: 'Stores all stronghold information',
        scope: 'world',    // Shared across all players
        config: false,     // Hidden from settings UI
        type: Object,      // Complex data structure
        default: {}
    });

    // User-configurable setting
    game.settings.register('strongholds-and-followers', 'enableAutoApplyBonuses', {
        name: 'Automatically Apply Bonuses',
        hint: 'Automatically apply stronghold bonuses when players take extended rests',
        scope: 'world',    // GM controls this
        config: true,      // Show in settings UI  
        type: Boolean,
        default: true
    });
});
```

### **2. API Exposure Pattern**
```javascript
// scripts/main.js
Hooks.once('init', async function() {
    // Expose module API for other modules/macros
    game.strongholds = {
        StrongholdManager,
        StrongholdViewer, 
        StrongholdData
    };
});

// Usage by other modules:
// new game.strongholds.StrongholdManager().render(true);
```

### **3. Handlebars Helper Registration**
```javascript
// scripts/main.js - Essential for template rendering
Hooks.once('init', async function() {
    // Register custom Handlebars helpers
    Handlebars.registerHelper('capitalize', function(str) {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    Handlebars.registerHelper('add', function(a, b) {
        return (a || 0) + (b || 0);
    });

    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('lookup', function(obj, key) {
        if (!obj || !key) return '';
        return obj[key] || '';
    });
});
```

### **4. UI Integration Patterns**

#### **Scene Controls Integration (GM)**
```javascript
// scripts/main.js
Hooks.on('getSceneControlButtons', (controls) => {
    if (!game.user.isGM) return;
    
    const tokenControls = controls.find(c => c.name === 'token');
    if (tokenControls) {
        tokenControls.tools.push({
            name: 'strongholds',
            title: 'Manage Strongholds',
            icon: 'fas fa-castle',
            button: true,
            onClick: () => {
                new StrongholdManager().render(true);
            }
        });
    }
});
```

#### **Player List Integration (Players)**
```javascript
// scripts/main.js
Hooks.on('renderPlayerList', (app, html, data) => {
    if (game.user.isGM) return;
    
    const strongholdButton = $(`
        <div class="strongholds-button" title="View Strongholds">
            <i class="fas fa-castle"></i>
            <span>Strongholds</span>
        </div>
    `);
    
    strongholdButton.on('click', () => {
        new StrongholdViewer().render(true);
    });
    
    html.append(strongholdButton);
});
```

### **5. System Integration Pattern (D&D 5e)**
```javascript
// scripts/main.js
Hooks.on('dnd5e.restCompleted', async (actor, data) => {
    if (!game.settings.get('strongholds-and-followers', 'enableAutoApplyBonuses')) return;
    if (data.longRest !== true) return;
    
    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
    const activeStrongholds = Object.values(strongholds).filter(s => s.active);
    
    if (activeStrongholds.length === 0) return;
    
    // Generate chat message with applicable bonuses
    let bonusMessage = `<h3>${actor.name} can benefit from stronghold bonuses:</h3><ul>`;
    // ... build message content
    
    ChatMessage.create({
        content: bonusMessage,
        whisper: [game.user.id]  // Private message to player
    });
});
```

## 📊 **Data Management Patterns**

### **Static Data Class Pattern**
```javascript
// scripts/stronghold-data.js
export class StrongholdData {
    static STRONGHOLD_TYPES = {
        TEMPLE: 'temple',
        KEEP: 'keep', 
        TOWER: 'tower',
        ESTABLISHMENT: 'establishment'
    };

    static STRONGHOLD_COSTS = {
        building: {
            'temple': 25000,
            'keep': 50000,
            // ...
        },
        upgrading: {
            2: 10000,
            3: 25000,
            // ...
        }
    };

    // Factory method pattern
    static createStronghold(name, type, classFlavor = null, level = 1, description = '') {
        return {
            id: foundry.utils.randomID(),
            name: name,
            type: type,
            // ... other properties
            createdBy: game.user.id,
            createdDate: new Date().toISOString()
        };
    }

    // Business logic methods
    static getBuildingCost(type) {
        return this.STRONGHOLD_COSTS.building[type] || 0;
    }
}
```

### **Settings-Based Persistence Pattern**
```javascript
// scripts/stronghold-data.js
static async addBonus(strongholdId, bonus) {
    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
    if (strongholds[strongholdId]) {
        if (!strongholds[strongholdId].bonuses) {
            strongholds[strongholdId].bonuses = [];
        }
        strongholds[strongholdId].bonuses.push({
            id: foundry.utils.randomID(),
            ...bonus,
            addedDate: new Date().toISOString()
        });
        return game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
    }
    return Promise.resolve();
}
```

## 🎭 **Application Patterns**

### **Legacy Application Pattern (Still Valid)**
```javascript
// scripts/stronghold-manager.js
export class StrongholdManager extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'stronghold-manager',
            title: 'Stronghold Manager',
            template: 'modules/strongholds-and-followers/templates/stronghold-manager.hbs',
            width: 800,
            height: 600,
            resizable: true,
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.tab-content', 
                    initial: 'strongholds'
                }
            ]
        });
    }

    async getData() {
        // Prepare template context
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const strongholdArray = Object.values(strongholds).map(stronghold => {
            return {
                ...stronghold,
                upgradeCost: StrongholdData.getUpgradeCost(stronghold.level, stronghold.level + 1),
                canUpgrade: stronghold.level < 5
            };
        });

        return {
            strongholds: strongholdArray,
            strongholdTypes: StrongholdData.STRONGHOLD_TYPES,
            classFlavors: StrongholdData.CLASS_FLAVORS,
            isGM: game.user.isGM
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Event delegation pattern
        html.find('.create-stronghold').click(this._onCreateStronghold.bind(this));
        html.find('.edit-stronghold').click(this._onEditStronghold.bind(this));
        html.find('.upgrade-stronghold').click(this._onUpgradeStronghold.bind(this));
    }
}
```

### **Dialog Pattern for Forms**
```javascript
// scripts/stronghold-manager.js
async _onCreateStronghold(event) {
    event.preventDefault();
    
    const dialog = new Dialog({
        title: 'Create New Stronghold',
        content: await renderTemplate('modules/strongholds-and-followers/templates/stronghold-form.hbs', {
            strongholdTypes: StrongholdData.STRONGHOLD_TYPES,
            classFlavors: StrongholdData.CLASS_FLAVORS,
            strongholdCosts: StrongholdData.STRONGHOLD_COSTS.building,
            isEdit: false
        }),
        buttons: {
            create: {
                label: 'Create',
                callback: async (html) => {
                    const formData = new FormData(html.find('form')[0]);
                    // Process form data...
                    await this._createStronghold(/* ... */);
                }
            },
            cancel: { label: 'Cancel' }
        },
        default: 'create'
    });

    dialog.render(true);
}
```

## 🎨 **Template Patterns**

### **Conditional Rendering**
```handlebars
{{!-- templates/stronghold-manager.hbs --}}
{{#if strongholds}}
    {{#each strongholds}}
    <div class="stronghold-item {{#unless active}}inactive{{/unless}}">
        <h3>{{name}}</h3>
        <div class="stronghold-details">
            <span class="stronghold-type">{{capitalize type}}</span>
            {{#if classFlavor}}
            <span class="stronghold-class">({{capitalize classFlavor}})</span>
            {{/if}}
            <span class="stronghold-level">Level {{level}}/5</span>
        </div>
        
        {{#if canUpgrade}}
        <button class="upgrade-stronghold" data-stronghold-id="{{id}}">
            Upgrade ({{upgradeCost}} gp)
        </button>
        {{/if}}
    </div>
    {{/each}}
{{else}}
<div class="no-strongholds">
    <p>No strongholds have been created yet.</p>
</div>
{{/if}}
```

### **Form Template Pattern**
```handlebars
{{!-- templates/stronghold-form.hbs --}}
<form class="stronghold-form">
    <div class="form-group">
        <label for="stronghold-name">Stronghold Name *</label>
        <input type="text" id="stronghold-name" name="name" 
               value="{{stronghold.name}}" required>
    </div>

    <div class="form-group">
        <label for="stronghold-type">Stronghold Type *</label>
        <select id="stronghold-type" name="type" required>
            <option value="">Choose a type...</option>
            {{#each strongholdTypes}}
            <option value="{{this}}" {{#if (eq this ../stronghold.type)}}selected{{/if}}>
                {{capitalize this}}{{#if ../strongholdCosts}} ({{lookup ../strongholdCosts this}} gp){{/if}}
            </option>
            {{/each}}
        </select>
    </div>
</form>
```

## 🎯 **Event Handling Patterns**

### **Data Attribute Pattern**
```javascript
// Use data attributes for event delegation
html.find('.upgrade-stronghold').click(this._onUpgradeStronghold.bind(this));

async _onUpgradeStronghold(event) {
    event.preventDefault();
    const strongholdId = event.currentTarget.dataset.strongholdId; // data-stronghold-id
    // ... handle upgrade
}
```

### **Confirmation Dialog Pattern**
```javascript
async _onDeleteStronghold(event) {
    event.preventDefault();
    const strongholdId = event.currentTarget.dataset.strongholdId;
    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
    const stronghold = strongholds[strongholdId];

    const confirmed = await Dialog.confirm({
        title: 'Delete Stronghold',
        content: `<p>Are you sure you want to delete <strong>${stronghold.name}</strong>?</p>
                  <p>This action cannot be undone.</p>`
    });

    if (confirmed) {
        delete strongholds[strongholdId];
        await game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
        ui.notifications.info(`Deleted stronghold: ${stronghold.name}`);
        this.render();
    }
}
```

## 🎨 **Styling Patterns**

### **Foundry CSS Variables**
```css
/* styles/strongholds.css */
.stronghold-item {
    background: var(--color-bg-option);
    border: 1px solid var(--color-border-light);
    border-radius: 6px;
    padding: 1rem;
}

.stronghold-item.inactive {
    opacity: 0.6;
    background: var(--color-bg-option-inactive);
}

.stronghold-level {
    background: var(--color-button-secondary);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
}
```

## 🔐 **Permission Patterns**

### **Role-Based UI**
```javascript
// Only show GM controls
if (game.user.isGM) {
    // Add management buttons
}

// Different interfaces for different users
Hooks.on('renderPlayerList', (app, html, data) => {
    if (game.user.isGM) return; // GM has different access
    // Add player-specific UI
});
```

## 🚀 **Performance Patterns**

### **Efficient Data Processing**
```javascript
// scripts/stronghold-manager.js
async getData() {
    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
    
    // Process data efficiently in one pass
    const strongholdArray = Object.values(strongholds).map(stronghold => {
        const upgradeCost = stronghold.level < 5 ? 
            StrongholdData.getUpgradeCost(stronghold.level, stronghold.level + 1) : 0;
        
        return {
            ...stronghold,
            upgradeCost,
            canUpgrade: stronghold.level < 5,
            totalValueCost: StrongholdData.getTotalCostForLevel(stronghold.type, stronghold.level)
        };
    });

    return {
        strongholds: strongholdArray,
        // ... other context
    };
}
```

## 📝 **Key Takeaways**

1. **Settings for Persistence**: Use world-scoped settings for shared data
2. **API Exposure**: Make your classes available via `game.moduleName`
3. **Hook Integration**: Use appropriate hooks for UI integration
4. **Data Attributes**: Use for clean event handling
5. **Template Helpers**: Register helpers for complex template logic
6. **Permission Checks**: Always validate user permissions
7. **Error Handling**: Graceful degradation with user feedback
8. **Performance**: Process data efficiently in getData()
9. **Localization Ready**: Structure for i18n even if not implemented
10. **Modern Patterns**: Follow FoundryVTT best practices and conventions

## 🎮 **D&D 5e System Integration Patterns**

### **Character Data Access**
```javascript
// scripts/stronghold-data.js - System-specific data extraction
static getCharacterClasses(actor) {
    if (!actor) return [];
    
    // D&D 5e specific class detection
    if (game.system.id === 'dnd5e') {
        const classes = actor.classes || {};
        return Object.keys(classes);
    }
    
    // Generic fallback
    const className = actor.system?.details?.class;
    return className ? [className] : [];
}

static getCharacterLevel(actor) {
    if (!actor) return 1;
    
    // D&D 5e specific level detection
    if (game.system.id === 'dnd5e') {
        return actor.system?.details?.level || 1;
    }
    
    // Generic fallback
    return actor.system?.level || actor.system?.details?.level || 1;
}

static actorHasMatchingClass(actor, classFlavor) {
    if (!actor || !classFlavor) return false;
    
    // D&D 5e specific class checking
    if (game.system.id === 'dnd5e') {
        const actorClasses = actor.classes || {};
        return Object.keys(actorClasses).some(className => 
            className.toLowerCase() === classFlavor.toLowerCase()
        );
    }
    
    // Generic fallback for other systems
    const actorType = actor.type?.toLowerCase() || '';
    const actorClass = actor.system?.details?.class?.toLowerCase() || '';
    return actorType === classFlavor.toLowerCase() || actorClass === classFlavor.toLowerCase();
}
```

### **D&D 5e Hook Integration**
```javascript
// scripts/main.js - Enhanced rest integration
Hooks.on('dnd5e.restCompleted', async (actor, data) => {
    if (!game.settings.get('strongholds-and-followers', 'enableAutoApplyBonuses')) return;
    if (data.longRest !== true) return;
    
    const actorName = StrongholdData.getCharacterName(actor);
    const actorLevel = StrongholdData.getCharacterLevel(actor);
    const actorClasses = StrongholdData.getCharacterClasses(actor);
    
    let bonusMessage = `<div class="stronghold-rest-bonuses">
        <h3><i class="fas fa-castle"></i> ${actorName} gains stronghold bonuses:</h3>
        <div class="character-info">
            <p><strong>Level:</strong> ${actorLevel} | <strong>Classes:</strong> ${actorClasses.join(', ') || 'None'}</p>
        </div>`;
    
    // Process applicable bonuses with character context
    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
    const activeStrongholds = Object.values(strongholds).filter(s => s.active);
    
    for (const stronghold of activeStrongholds) {
        const applicableBonuses = StrongholdData.getApplicableBonuses(stronghold, actor);
        // ... generate bonus list
    }
    
    ChatMessage.create({
        content: bonusMessage,
        whisper: [game.user.id],
        speaker: ChatMessage.getSpeaker({actor: actor})
    });
});

// Future hook integrations for rolls
Hooks.on('dnd5e.preRollAbilitySave', (actor, rollData, abilityId) => {
    // Add stronghold bonuses to ability saves
    console.log('Ability save detected for', actor.name);
});

Hooks.on('dnd5e.preRollSkill', (actor, rollData, skillId) => {
    // Add stronghold bonuses to skill rolls  
    console.log('Skill roll detected for', actor.name, 'skill:', skillId);
});
```

### **System Compatibility Checking**
```javascript
// scripts/main.js - Runtime system validation
Hooks.once('ready', async function() {
    // Check for D&D 5e system compatibility
    if (game.system.id !== 'dnd5e') {
        ui.notifications.warn('This module is designed for the D&D 5e system. Some features may not work correctly.');
        console.warn('Expected D&D 5e system, found:', game.system.id);
    } else {
        console.log('D&D 5e system detected, version:', game.system.version);
    }
});
```

### **Enhanced Template Context**
```javascript
// scripts/stronghold-viewer.js - D&D 5e character integration
async getData() {
    // Get the user's current character
    const userCharacter = game.user.character;
    const characterClasses = userCharacter ? StrongholdData.getCharacterClasses(userCharacter) : [];
    const characterLevel = userCharacter ? StrongholdData.getCharacterLevel(userCharacter) : 1;
    
    const strongholdsWithBonuses = activeStrongholds.map(stronghold => {
        const applicableBonuses = userCharacter ? 
            StrongholdData.getApplicableBonuses(stronghold, userCharacter) : 
            customBonuses.filter(b => b.partyWide);
        
        return {
            ...stronghold,
            myBonuses: applicableBonuses,
            hasClassBonuses: stronghold.classFlavor && 
                StrongholdData.actorHasMatchingClass(userCharacter, stronghold.classFlavor)
        };
    });

    return {
        strongholds: strongholdsWithBonuses,
        characterName: StrongholdData.getCharacterName(userCharacter),
        characterClasses: characterClasses,
        characterLevel: characterLevel,
        systemId: game.system.id
    };
}
```

This module serves as a practical reference for these patterns in a real-world FoundryVTT module with full D&D 5e system integration.
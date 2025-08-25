# FoundryVTT Quick Reference for AI Agents

> **Quick lookup reference** for common FoundryVTT development patterns and API calls.

## 🚀 **Quick Start Patterns**

### **Module Entry Point**

```javascript
// scripts/main.js - Standard module initialization
import { MyApplication } from './my-application.js';

Hooks.once('init', () => {
  console.log('Module loading...');
  // Register settings, classes, etc.
  game.modules.get('module-name').api = { MyApplication };
});

Hooks.once('ready', () => {
  console.log('Module ready');
  // Post-init setup
});
```

### **Simple Application (Modern)**

```javascript
export class MyApp extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: 'my-app',
    tag: 'div',
    window: { title: 'My App', width: 400, height: 300 },
  };

  static PARTS = {
    main: { template: 'modules/my-module/templates/app.hbs' },
  };

  async _prepareContext() {
    return { data: 'Hello World' };
  }
}

// Usage: new MyApp().render(true);
```

## ⚙️ **Settings Quick Reference**

```javascript
// Register setting
game.settings.register('module-name', 'setting-key', {
  name: 'Display Name',
  hint: 'Description',
  scope: 'world', // 'world' | 'client' | 'user'
  config: true, // Show in UI
  type: Boolean, // String | Number | Boolean | Object
  default: false,
});

// Get/Set
const value = game.settings.get('module-name', 'setting-key');
await game.settings.set('module-name', 'setting-key', newValue);
```

## 🎣 **Essential Hooks**

```javascript
// Module lifecycle
Hooks.once('init', () => {});
Hooks.once('ready', () => {});

// Scene Controls Toolbar: customize left toolbar buttons
// Reference: https://foundryvtt.com/api/Hooks.html#getSceneControlButtons
Hooks.on('getSceneControlButtons', (controls) => {});

// Document operations
Hooks.on('createActor', (actor, options, userId) => {});
Hooks.on('updateActor', (actor, updateData, options, userId) => {});
Hooks.on('deleteActor', (actor, options, userId) => {});

// UI rendering
Hooks.on('renderActorSheet', (app, html, data) => {});
Hooks.on('renderChatMessage', (message, html, data) => {});

// System-specific (D&D 5e)
Hooks.on('dnd5e.restCompleted', (actor, data) => {});
Hooks.on('dnd5e.rollAbilitySave', (actor, roll, abilityId) => {});
```

## 🎲 **Common Game Object Access**

```javascript
// Users and permissions
game.user; // Current user
game.user.isGM; // Boolean: is GM
game.users; // All users collection

// Actors (characters, NPCs)
game.actors; // All actors
game.actors.get(id); // Get by ID
game.canvas.tokens.controlled[0]?.actor; // Selected token's actor

// Items and inventory
game.items; // All items
actor.items; // Actor's items
actor.items.find((i) => i.name === 'Sword');

// Scenes and canvas
game.scenes; // All scenes
game.scenes.active; // Current scene
game.canvas; // Canvas API

// Chat and notifications
ChatMessage.create({ content: 'Hello' });
ui.notifications.info('Success!');
ui.notifications.error('Error!');
ui.notifications.warn('Warning!');
```

## 📄 **Template & UI Helpers**

```javascript
// Render template
const html = await renderTemplate('path/to/template.hbs', context);

// Handlebars helpers in templates
{{localize "KEY"}}              // Localization
{{capitalize string}}           // Capitalize first letter
{{#if condition}}...{{/if}}     // Conditionals
{{#each array}}{{this}}{{/each}} // Loops

// Dialog creation
new Dialog({
    title: 'Choose',
    content: '<p>Select an option:</p>',
    buttons: {
        yes: { label: 'Yes', callback: () => {} },
        no: { label: 'No', callback: () => {} }
    }
}).render(true);

// Form application pattern
export class MyForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'my-form',
            title: 'My Form',
            template: 'path/to/form.hbs'
        });
    }

    async _updateObject(event, formData) {
        // Process form data
    }
}
```

## 🔍 **Data Access Patterns**

### **D&D 5e Specific**

```javascript
// Actor data
actor.system.details.level; // Character level
actor.system.abilities.str.value; // Ability scores
actor.system.attributes.hp.value; // Current HP
actor.classes; // Character classes

// Item data
item.system.damage.parts; // Damage dice
item.system.properties; // Weapon properties
item.system.equipped; // Is equipped

// Spells and features
actor.items.filter((i) => i.type === 'spell');
actor.items.filter((i) => i.type === 'feat');
```

### **Universal Patterns**

```javascript
// Safe property access
actor.system?.details?.level || 1;
item.system?.equipped ?? false;

// Type checking
if (actor.type === 'character') {
}
if (item.type === 'weapon') {
}
```

## 🛡️ **Security & Validation**

```javascript
// Permission checks
if (!game.user.isGM) return;
if (!actor.isOwner) return;

// Input validation
function validateString(input, maxLength = 100) {
  return typeof input === 'string' && input.length > 0 && input.length <= maxLength;
}

// Safe HTML
const safeText = $('<div>').text(userInput).html();
```

## 🎨 **Styling Quick Tips**

```css
/* Use Foundry CSS variables */
.my-element {
    background: var(--color-bg-option);
    border: 1px solid var(--color-border-light);
    color: var(--color-text-dark-primary);
}

/* Common Foundry classes */
.window-app              /* Standard window styling */
.sheet                   /* Character/item sheet styling */
.form-group             /* Form field groups */
.flexrow, .flexcol      /* Flex layouts */
```

## 🚨 **Common Gotchas**

```javascript
// ❌ Wrong: Sync operations that should be async
game.settings.set('module', 'key', value);

// ✅ Right: Await async operations
await game.settings.set('module', 'key', value);

// ❌ Wrong: jQuery not available in ApplicationV2
this.element.find('.selector')

// ✅ Right: Use vanilla JS
this.element.querySelector('.selector')

// ❌ Wrong: Direct DOM manipulation
document.getElementById('some-id').innerHTML = content;

// ✅ Right: Use Foundry patterns
const element = html.find('#some-id')[0];
element.textContent = content;

// ❌ Wrong: Forgetting to call super
render() {
    return this;
}

// ✅ Right: Always call super
render(force, options) {
    return super.render(force, options);
}
```

## 🧰 **Utility Functions**

```javascript
// Debounce user input
const debouncedFn = foundry.utils.debounce(originalFn, 300);

// Merge objects safely
const merged = foundry.utils.mergeObject(obj1, obj2);

// Generate random ID
const id = foundry.utils.randomID();

// Deep clone
const cloned = foundry.utils.duplicate(original);

// Wait for condition
await foundry.utils.wait(1000); // Wait 1 second
```

## 📦 **Module Manifest Essentials**

```json
{
  "id": "unique-module-id",
  "title": "Display Title",
  "version": "1.0.0",
  "compatibility": {
    "minimum": "11",
    "verified": "13"
  },
  "esmodules": ["scripts/main.js"],
  "styles": ["styles/module.css"],
  "languages": [
    {
      "lang": "en",
      "name": "English",
      "path": "lang/en.json"
    }
  ]
}
```

## 🔗 **Quick Links**

- **API Docs**: https://foundryvtt.com/api/
- **Community Wiki**: https://foundryvtt.wiki/en/development/
- **Discord**: https://discord.gg/foundryvtt (#dev-support)

---

_Keep this reference handy for quick lookups during FoundryVTT development!_

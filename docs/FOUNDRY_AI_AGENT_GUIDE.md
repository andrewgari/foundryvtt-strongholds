# FoundryVTT Development Guide for AI Agents

> **Purpose**: This document provides AI agents with comprehensive guidelines for developing FoundryVTT modules, systems, and applications following best practices and official API patterns.

## 📚 **API Reference & Authority**

### **Primary Sources**

- **Official API**: https://foundryvtt.com/api/ (Version 13+)
- **Community Wiki**: https://foundryvtt.wiki/en/development/api
- **Local API**: `yourFoundryInstallPath/resources/app/client/` (Source code reference)

### **API Visibility Annotations**

Always respect these annotations when using Foundry methods:

- **`@public`**: ✅ Safe to use externally, deprecation notices provided
- **`@protected`**: ⚠️ Subclass use only, may override when extending
- **`@private`**: ❌ Internal use only, breaking changes without notice
- **`@internal`**: ❌ Core framework only, never use

### **Naming Convention Rules**

- Methods starting with `_` are typically private
- Methods starting with `#` are truly private (JavaScript enforcement)
- Always check annotations, not just naming patterns

---

## 🏗️ **Application Architecture**

### **Modern Application Classes (v12+)**

#### **ApplicationV2** (Recommended for New Development)

```javascript
// ✅ CORRECT: Modern ApplicationV2 pattern
export class MyApplication extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: 'my-application',
    tag: 'div',
    window: {
      title: 'My Application',
      width: 600,
      height: 400,
    },
    form: {
      handler: MyApplication.formHandler,
      submitOnChange: true,
    },
  };

  static PARTS = {
    main: {
      template: 'modules/my-module/templates/main.hbs',
    },
  };

  // No need for super.mergeObject - automatic inheritance
  async _prepareContext(options) {
    const context = {};
    // Prepare your context
    return context;
  }

  static async formHandler(event, form, formData) {
    // Modern form handling
  }
}
```

#### **Legacy Application** (Backward Compatibility)

```javascript
// ⚠️ LEGACY: Still supported until v16, but avoid for new development
export class LegacyApplication extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'legacy-application',
      title: 'Legacy Application',
      template: 'modules/my-module/templates/legacy.hbs',
      width: 600,
      height: 400,
    });
  }

  async getData() {
    // Legacy pattern
    return {};
  }

  activateListeners(html) {
    super.activateListeners(html);
    // jQuery-based event handling
  }
}
```

### **Key Architectural Principles**

1. **Document-Centric Design**: All data organized around Document classes
2. **Hook-Driven Events**: Use Hooks system for extensibility
3. **Settings Management**: World vs Client vs User scopes
4. **Template System**: Handlebars templates with proper context

---

## 🎣 **Hooks System Best Practices**

### **Common Hook Patterns**

```javascript
// ✅ CORRECT: Hook registration in init
Hooks.once('init', () => {
  console.log('Module initializing...');
  // Register settings, classes, etc.
});

Hooks.once('ready', () => {
  console.log('Module ready');
  // Post-initialization setup
});

// ✅ CORRECT: Conditional hook execution
Hooks.on('updateActor', (actor, updateData, options, userId) => {
  if (!game.user.isGM) return; // Early exit pattern
  // Process update
});

// ✅ CORRECT: Hook cleanup
Hooks.off('renderApplication', hookId);
```

### **Hook Categories**

- **Init Hooks**: `init`, `ready`, `setup`
- **Document Hooks**: `create*`, `update*`, `delete*`
- **Render Hooks**: `render*`, `close*`
- **Canvas Hooks**: `canvasInit`, `canvasReady`
- **System Hooks**: System-specific events

---

## ⚙️ **Settings Management**

### **Setting Registration Patterns**

```javascript
// ✅ CORRECT: Comprehensive settings registration
game.settings.register('module-name', 'setting-key', {
  name: 'Setting Display Name',
  hint: 'Helpful description for users',
  scope: 'world', // 'world', 'client', or 'user'
  config: true, // Show in settings UI
  type: Boolean, // String, Number, Boolean, Object, Array
  default: false,
  requiresReload: true, // If changing requires reload
  onChange: (value) => {
    // React to setting changes
  },
});

// ✅ CORRECT: Setting usage
const enabled = game.settings.get('module-name', 'setting-key');
await game.settings.set('module-name', 'setting-key', newValue);
```

### **Setting Scopes**

- **`world`**: Shared across all users in the world (GM-controlled)
- **`client`**: Local to the current client installation
- **`user`**: Per-user settings within the world

---

## 📄 **Template & UI Patterns**

### **Template Organization**

```
module-folder/
├── templates/
│   ├── applications/
│   │   ├── main-app.hbs
│   │   └── dialog.hbs
│   ├── parts/
│   │   ├── header.hbs
│   │   └── footer.hbs
│   └── forms/
│       └── settings-form.hbs
```

### **Handlebars Best Practices**

```handlebars
{{! ✅ CORRECT: Conditional rendering }}
{{#if hasPermission}}
  <button class='action-button' data-action='perform'>Action</button>
{{/if}}

{{! ✅ CORRECT: Safe property access }}
{{#each items}}
  <li data-id='{{id}}'>
    {{name}}
    ({{#if description}}{{description}}{{else}}No description{{/if}})
  </li>
{{/each}}

{{! ✅ CORRECT: Helper usage }}
{{localize 'MODULE.SettingName'}}
{{numberFormat value decimals=2}}
```

### **Event Handling (Modern)**

```javascript
// ✅ CORRECT: Modern DOM event handling (ApplicationV2)
_attachEventListeners() {
    this.element.addEventListener('click', this._onButtonClick.bind(this));
    this.element.addEventListener('submit', this._onFormSubmit.bind(this));
}

_onButtonClick(event) {
    if (!event.target.matches('.action-button')) return;
    const action = event.target.dataset.action;
    // Handle action
}

// ⚠️ LEGACY: jQuery pattern (still valid but not preferred)
activateListeners(html) {
    super.activateListeners(html);
    html.find('.action-button').click(this._onButtonClick.bind(this));
}
```

---

## 📦 **Module Structure & Manifest**

### **Modern Module.json (v13+)**

```json
{
  "id": "module-name",
  "title": "Module Title",
  "description": "Module description",
  "version": "1.0.0",
  "authors": [{ "name": "Author Name", "email": "email@example.com" }],
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
  ],
  "url": "https://github.com/username/module-name",
  "manifest": "https://github.com/username/module-name/releases/latest/download/module.json",
  "download": "https://github.com/username/module-name/releases/latest/download/module-name.zip",
  "bugs": "https://github.com/username/module-name/issues"
}
```

### **File Structure Best Practices**

```
module-name/
├── module.json
├── scripts/
│   ├── main.js           # Entry point
│   ├── applications/     # UI classes
│   ├── documents/        # Data models
│   └── utils/           # Utilities
├── templates/
├── styles/
├── lang/
│   └── en.json
├── assets/              # Images, icons
└── packs/              # Compendium packs
```

---

## 🔒 **Security & Performance Best Practices**

### **Security Patterns**

```javascript
// ✅ CORRECT: Permission checks
if (!game.user.isGM) {
  ui.notifications.error('Insufficient permissions');
  return;
}

// ✅ CORRECT: Data validation
function validateInput(data) {
  if (typeof data.name !== 'string' || data.name.length === 0) {
    throw new Error('Invalid name provided');
  }
  return data;
}

// ✅ CORRECT: Safe HTML insertion
const safeHtml = $('<div>').text(userInput).html();
```

### **Performance Patterns**

```javascript
// ✅ CORRECT: Debouncing user input
const debouncedHandler = foundry.utils.debounce(this._handleInput.bind(this), 300);

// ✅ CORRECT: Efficient DOM queries
const elements = this.element.querySelectorAll('.target-class');

// ✅ CORRECT: Batch operations
const updates = actors.map((actor) => ({ _id: actor.id, 'system.health.value': newValue }));
await Actor.updateDocuments(updates);
```

---

## ❌ **Common Anti-Patterns to Avoid**

### **What NOT to Do**

```javascript
// ❌ WRONG: Direct DOM manipulation without Foundry patterns
document.getElementById('some-id').innerHTML = userContent;

// ❌ WRONG: Using private methods
someObject._privateMethod(); // May break without notice

// ❌ WRONG: Synchronous operations that should be async
game.settings.set('module', 'key', value); // Missing await

// ❌ WRONG: Memory leaks with event listeners
setInterval(() => {
    // This runs forever even after module disable
}, 1000);

// ❌ WRONG: Overriding core methods without super
render() {
    // Missing super.render() call
    return this;
}

// ❌ WRONG: Hard-coded strings instead of localization
ui.notifications.info('Action completed successfully');
// Should be: ui.notifications.info(game.i18n.localize('MODULE.ActionComplete'));
```

### **What TO Do Instead**

```javascript
// ✅ CORRECT: Proper async handling
await game.settings.set('module', 'key', value);

// ✅ CORRECT: Safe HTML with Foundry utilities
const element = document.createElement('div');
element.textContent = userInput; // Safe from XSS

// ✅ CORRECT: Proper method extension
render(force = false, options = {}) {
    // Custom logic before
    const result = super.render(force, options);
    // Custom logic after
    return result;
}

// ✅ CORRECT: Localization
ui.notifications.info(game.i18n.localize('MODULE.ActionComplete'));
```

---

## 🎯 **System Integration Patterns**

### **D&D 5e System Integration**

```javascript
// ✅ CORRECT: System detection
if (game.system.id !== 'dnd5e') {
  ui.notifications.warn('This module requires the D&D 5e system');
  return;
}

// ✅ CORRECT: Accessing D&D 5e data
const actor = game.actors.get(actorId);
const classes = actor.classes; // D&D 5e specific
const level = actor.system.details.level;

// ✅ CORRECT: D&D 5e hooks
Hooks.on('dnd5e.restCompleted', (actor, data) => {
  if (data.longRest) {
    // Handle long rest
  }
});
```

### **Universal System Patterns**

```javascript
// ✅ CORRECT: System-agnostic approach
const actor = game.actors.get(actorId);
const actorData = actor.system; // Generic system data access

// ✅ CORRECT: Conditional system features
switch (game.system.id) {
  case 'dnd5e':
    return actor.system.details.level;
  case 'pf2e':
    return actor.system.details.level.value;
  default:
    return actor.system.level || 1;
}
```

---

## 🧪 **Testing & Debugging**

### **Debug Patterns**

```javascript
// ✅ CORRECT: Conditional logging
const DEBUG = game.modules.get('module-name')?.active && game.settings.get('module-name', 'debug');
if (DEBUG) console.log('Debug info:', data);

// ✅ CORRECT: Error handling
try {
  await riskyOperation();
} catch (error) {
  console.error('Module Error:', error);
  ui.notifications.error('Operation failed. Check console for details.');
}

// ✅ CORRECT: Development helpers
if (game.modules.get('module-name')?.active && game.user.isGM) {
  window.MyModule = {
    api: MyModuleAPI,
    debug: true,
  };
}
```

---

## 📋 **Development Checklist**

### **Before Release**

- [ ] All methods use `@public` API only
- [ ] No direct access to `_private` methods
- [ ] Proper error handling and user feedback
- [ ] Localization for all user-facing strings
- [ ] Settings properly scoped and documented
- [ ] Templates use safe data binding
- [ ] Event listeners properly cleaned up
- [ ] Performance optimizations applied
- [ ] Cross-system compatibility tested (if applicable)
- [ ] Version compatibility verified

### **Code Quality**

- [ ] ES6+ modules used consistently
- [ ] Modern JavaScript features (async/await, destructuring)
- [ ] Clear variable and function naming
- [ ] JSDoc comments for public methods
- [ ] Consistent code formatting
- [ ] No console.log statements in production

---

## 🔄 **Migration Guidelines**

### **ApplicationV2 Migration**

When migrating from legacy Application to ApplicationV2:

1. **Replace `defaultOptions`** with `DEFAULT_OPTIONS`
2. **Replace `getData()`** with `_prepareContext()`
3. **Update form handling** to use built-in form patterns
4. **Replace jQuery** with vanilla JavaScript DOM methods
5. **Update event handling** patterns
6. **Test thoroughly** - behavior may differ

### **Version Compatibility**

- **Target v11+** for broad compatibility
- **Use v13 features** for modern development
- **Plan deprecation** for private API usage
- **Test across versions** when possible

---

## 📖 **Additional Resources**

- [Official Development Guide](https://foundryvtt.com/article/intro-development/)
- [Community Wiki Development Section](https://foundryvtt.wiki/en/development/)
- [FoundryVTT Discord #dev-support](https://discord.gg/foundryvtt)
- [GitHub Module Template](https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template)

---

> **Remember**: Always prioritize using the **public API** and following **official patterns**. When in doubt, consult the official documentation or ask on the FoundryVTT Discord developer channels.

_This guide is maintained for AI agents developing FoundryVTT content. Last updated: 2025_

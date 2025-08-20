import { StrongholdManager } from './stronghold-manager.js';
import { StrongholdViewer } from './stronghold-viewer.js';
import { StrongholdData } from './stronghold-data.js';

Hooks.once('init', async function() {
    console.log('Strongholds & Followers | Initializing');

    // Register Handlebars helpers
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


    // Number formatting helpers
    Handlebars.registerHelper('formatNumber', function(value) {
        const n = Number(value);
        if (isNaN(n)) return value ?? '';
        return n.toLocaleString();
    });

    // Small helpers for templates
    Handlebars.registerHelper('and', function(a, b) {
        return Boolean(a && b);
    });
    Handlebars.registerHelper('formatNumber', function(n) {
        const num = Number(n);
        if (!isFinite(num)) return n;
        return num.toLocaleString();
    });

    // Helper to fetch class flavor description from data
    Handlebars.registerHelper('getClassFlavorDescription', function(flavor) {
        if (!flavor) return '';
        return StrongholdData.getClassFlavorDescription(flavor);
    });

    // Helper to fetch class flavor display name
    Handlebars.registerHelper('getClassFlavorDisplay', function(flavor) {
        if (!flavor) return '';
        return StrongholdData.CLASS_FLAVOR_DISPLAY[flavor] || flavor;
    });


    game.settings.register('strongholds-and-followers', 'strongholds', {
        name: 'Strongholds Data',
        hint: 'Stores all stronghold information',
        scope: 'world',
        config: false,
        type: Object,
        default: {}
    });

    game.settings.register('strongholds-and-followers', 'enableAutoApplyBonuses', {
        name: 'Automatically Apply Bonuses',
        hint: 'Automatically apply stronghold bonuses when players take extended rests',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    // Dev setting: Auto reload clients when dev-reload.json changes
    game.settings.register('strongholds-and-followers', 'devAutoReload', {
        name: 'Dev: Auto Reload on Change',
        hint: 'When enabled (client-side), the client polls dev-reload.json and reloads on change. For development only.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
    });

    // Add a Configure Settings menu button in the header to open Strongholds (GM or Player view)
    game.settings.registerMenu('strongholds-and-followers', 'manageStrongholds', {
        name: 'Manage Strongholds',
        hint: 'Open the Strongholds management/viewer window',
        icon: 'fas fa-castle',
        type: class {
            constructor() {
                if (game.user.isGM) new StrongholdManager().render(true);
                else new StrongholdViewer().render(true);
            }
        },
        restricted: false
    });

    // Expose API
    game.strongholds = {
        StrongholdManager,
        StrongholdViewer,
        StrongholdData
    };

    // Helper: GM-only broadcast to reload all clients
    game.strongholds.reloadAllClients = function() {
        if (!game.user.isGM) return;
        try {
            game.socket.emit('module.strongholds-and-followers', { action: 'reload' });
            ui.notifications.info('Requested reload for all connected clients...');
        } catch (e) {
            console.error('Strongholds & Followers | Failed to emit reload', e);
            ui.notifications.error('Failed to request reload');
        }
    };
});

// Listen for reload requests and perform a soft reload
Hooks.on('ready', () => {
    try {
        game.socket.on('module.strongholds-and-followers', (payload) => {
            if (payload?.action === 'reload') {
                // Soft reload assets and UI; fallback to full page reload
                ui.notifications.info('Strongholds & Followers: Reload requested by GM');
                window.location.reload();
            }
        });
    } catch (e) {
        console.error('Strongholds & Followers | Failed to register reload socket listener', e);
    }
});

// Optional: Development auto-reload loop (client-side, off by default)
Hooks.on('ready', () => {
    const enabled = game.settings.get('strongholds-and-followers', 'devAutoReload');
    if (!enabled) return;

    let lastToken = null;
    const url = `modules/${game.modules.get('strongholds-and-followers')?.id}/dev-reload.json`;

    async function poll() {
        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res.ok) {
                const data = await res.json();
                if (data && data.token && lastToken && data.token !== lastToken) {
                    ui.notifications.info('Strongholds & Followers: Detected changes — reloading...');
                    window.location.reload();
                    return;
                }
                lastToken = data?.token || lastToken;
            }
        } catch (e) {
            // swallow errors during dev
        } finally {
            setTimeout(poll, 1500);
        }
    }
    poll();
});


Hooks.once('ready', async function() {
    console.log('Strongholds & Followers | Ready');

    // Check for D&D 5e system compatibility
    if (game.system.id !== 'dnd5e') {
        ui.notifications.warn('Strongholds & Followers: This module is designed for the D&D 5e system. Some features may not work correctly.');
        console.warn('Strongholds & Followers: Expected D&D 5e system, found:', game.system.id);
    } else {
        console.log('Strongholds & Followers | D&D 5e system detected, version:', game.system.version);
    }

    if (game.user.isGM) {
        ui.notifications.info("Strongholds & Followers module loaded. Click the 'Strongholds' button in the scene controls toolbar.");
    }
});

Hooks.on('getSceneControlButtons', (controls) => {
    try {
        // Foundry v13: controls is a record (object) keyed by control set name
        if (controls && !Array.isArray(controls)) {
            console.log('Strongholds & Followers | Registering scene controls (object mode)');
            controls.strongholds = {
                name: 'strongholds',
                title: 'Strongholds',
                icon: 'fas fa-home',
                visible: true,
                activeTool: 'view',
                tools: {
                    view: {
                        name: 'view',
                        title: 'View',
                        icon: 'fas fa-eye',
                        button: true,
                        visible: true,
                        onClick: () => new StrongholdViewer().render(true)
                    },
                    manage: {
                        name: 'manage',
                        title: 'Manage',
                        icon: 'fas fa-cog',
                        button: true,
                        visible: game.user.isGM,
                        onClick: () => new StrongholdManager().render(true)
                    }
                }
            };
            return;
        }
        // Fallback for v12/v10 compatibility: array-based controls
        if (Array.isArray(controls)) {
            const group = {
                name: 'strongholds',
                title: 'Strongholds',
                icon: 'fas fa-home',
                tools: [
                    {
                        name: 'view',
                        title: 'View',
                        icon: 'fas fa-eye',
                        button: true,
                        visible: true,
                        onClick: () => {
                            new StrongholdViewer().render(true);
                        }
                    },
                    {
                        name: 'manage',
                        title: 'Manage',
                        icon: 'fas fa-cog',
                        button: true,
                        visible: game.user.isGM,
                        onClick: () => {
                            new StrongholdManager().render(true);
                        }
                    }
                ]
            };
            controls.push(group);
        }
    } catch (err) {
        console.error('Strongholds & Followers | Failed to register scene controls', err);
    }
});

// Remove player-list button in favor of unified toolbar button above

Hooks.on('dnd5e.restCompleted', async (actor, data) => {
    if (!game.settings.get('strongholds-and-followers', 'enableAutoApplyBonuses')) return;
    if (data.longRest !== true) return;

    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
    const activeStrongholds = Object.values(strongholds).filter(s => s.active);

    if (activeStrongholds.length === 0) return;

    const actorName = StrongholdData.getCharacterName(actor);
    const actorLevel = StrongholdData.getCharacterLevel(actor);
    const actorClasses = StrongholdData.getCharacterClasses(actor);

    let bonusMessage = `<div class="stronghold-rest-bonuses">
        <h3><i class="fas fa-castle"></i> ${actorName} gains stronghold bonuses:</h3>
        <div class="character-info">
            <p><strong>Level:</strong> ${actorLevel} | <strong>Classes:</strong> ${actorClasses.join(', ') || 'None'}</p>
        </div>
        <ul>`;

    let hasBonuses = false;

    for (const stronghold of activeStrongholds) {
        const applicableBonuses = StrongholdData.getApplicableBonuses(stronghold, actor);
        if (applicableBonuses.length > 0) {
            hasBonuses = true;
            bonusMessage += `<li class="stronghold-bonus-group">
                <strong>${stronghold.name}</strong> (${stronghold.type}, Level ${stronghold.level})
                ${stronghold.classFlavor ? ` - <em>${stronghold.classFlavor} flavored</em>` : ''}:
                <ul>`;

            for (const bonus of applicableBonuses) {
                const bonusType = bonus.partyWide ? 'Party-wide' : 'Personal';
                bonusMessage += `<li class="bonus-item">
                    <strong>${bonus.name}</strong>: ${bonus.description}
                    <em>(${bonusType})</em>
                </li>`;
            }
            bonusMessage += '</ul></li>';
        }
    }

    bonusMessage += '</ul></div>';

    if (hasBonuses) {
        ChatMessage.create({
            content: bonusMessage,
            whisper: [game.user.id],
            speaker: ChatMessage.getSpeaker({actor: actor})
        });

        console.log(`Strongholds & Followers | Applied bonuses to ${actorName} (${actorClasses.join(', ')})`);
    }
});

// Additional D&D 5e integration hooks
Hooks.on('dnd5e.preRollAbilitySave', (actor, rollData, abilityId) => {
    // Future: Add stronghold bonuses to ability saves
    console.log('Strongholds & Followers | Ability save detected for', actor.name);
});

Hooks.on('dnd5e.preRollSkill', (actor, rollData, skillId) => {
    // Future: Add stronghold bonuses to skill rolls
    console.log('Strongholds & Followers | Skill roll detected for', actor.name, 'skill:', skillId);
});

console.log('Strongholds & Followers | Module loaded');

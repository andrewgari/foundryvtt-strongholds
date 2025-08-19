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

    game.strongholds = {
        StrongholdManager,
        StrongholdViewer,
        StrongholdData
    };
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
            controls.strongholds = {
                name: 'strongholds',
                title: 'Strongholds',
                icon: 'fas fa-home',
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

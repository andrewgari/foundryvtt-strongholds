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

    game.strongholds = {
        StrongholdManager,
        StrongholdViewer,
        StrongholdData
    };
});

Hooks.once('ready', async function() {
    console.log('Strongholds & Followers | Ready');
    
    if (game.user.isGM) {
        ui.notifications.info("Strongholds & Followers module loaded. Use the 'Manage Strongholds' button in the scene controls.");
    }
});

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

Hooks.on('dnd5e.restCompleted', async (actor, data) => {
    if (!game.settings.get('strongholds-and-followers', 'enableAutoApplyBonuses')) return;
    if (data.longRest !== true) return;
    
    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
    const activeStrongholds = Object.values(strongholds).filter(s => s.active);
    
    if (activeStrongholds.length === 0) return;
    
    let bonusMessage = `<h3>${actor.name} can benefit from stronghold bonuses:</h3><ul>`;
    let hasBonuses = false;
    
    for (const stronghold of activeStrongholds) {
        const customBonuses = stronghold.bonuses || [];
        if (customBonuses.length > 0) {
            hasBonuses = true;
            bonusMessage += `<li><strong>${stronghold.name}</strong> (Level ${stronghold.level}):<ul>`;
            for (const bonus of customBonuses) {
                bonusMessage += `<li>${bonus.name}: ${bonus.description}</li>`;
            }
            bonusMessage += '</ul></li>';
        }
    }
    
    bonusMessage += '</ul>';
    
    if (hasBonuses) {
        ChatMessage.create({
            content: bonusMessage,
            whisper: [game.user.id]
        });
    }
});

console.log('Strongholds & Followers | Module loaded');
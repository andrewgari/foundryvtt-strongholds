export class StrongholdData {
    static STRONGHOLD_TYPES = {
        TEMPLE: 'temple',
        KEEP: 'keep',
        TOWER: 'tower',
        ESTABLISHMENT: 'establishment'
    };

    static STRONGHOLD_TYPE_DESCRIPTIONS = {
        keep: 'A fortified residence for martial leadership. Emphasizes training drills, watch rotations, and attracts veteran retainers.',
        temple: 'A sacred site of worship and healing. Offers rites, blessings, sanctuary, and faithful acolytes.',
        tower: 'A seat of arcane study and experimentation. Enables research, spell scribing, wards, and curious constructs.',
        establishment: 'A hub of commerce and influence. Generates income, rumors, contacts, and favors from patrons.'
    };

    static getTypeDescription(type) {
        return this.STRONGHOLD_TYPE_DESCRIPTIONS[type] || '';
    }


    static CLASS_FLAVORS = {
        BARBARIAN: 'barbarian',
        BARD: 'bard',
        CLERIC: 'cleric',
        DRUID: 'druid',
        FIGHTER: 'fighter',
        MONK: 'monk',
        PALADIN: 'paladin',
        RANGER: 'ranger',
        ROGUE: 'rogue',
        SORCERER: 'sorcerer',
        WARLOCK: 'warlock',
        WIZARD: 'wizard'
    };

    static CLASS_FLAVOR_DISPLAY = {
        barbarian: 'Barbarian’s Camp',
        bard: 'Bard’s Theater',
        cleric: 'Cleric’s Church',
        druid: 'Druid’s Grove',
        fighter: 'Fighter’s Fortress',
        monk: 'Monk’s Monastery',
        paladin: 'Paladin’s Chapel',
        ranger: 'Ranger’s Lodge',
        rogue: 'Rogue’s Tavern',
        sorcerer: 'Sorcerer’s Sanctum',
        warlock: 'Warlock’s Fane',
        wizard: 'Wizard’s Library'
    };

    static CLASS_FLAVOR_DESCRIPTIONS = {
        barbarian: 'A rugged camp of warbands where trials, feasts, and raids are mustered.',
        bard: 'A lively theater that stages performances, spreads renown, and sways local opinion.',
        cleric: 'A holy church that offers rites, healing, and guidance to the faithful.',
        druid: 'A sacred grove tended by circles, where nature spirits are invoked and seasons observed.',
        fighter: 'A disciplined fortress with drill yards, armories, and veteran captains.',
        monk: 'A quiet monastery devoted to austerity, training, and contemplative practice.',
        paladin: 'A consecrated chapel that upholds oaths, hosts vigils, and shelters the weak.',
        ranger: 'A secluded lodge for scouts and trackers, mapping trails and warding borders.',
        rogue: 'A bustling tavern that trades in secrets, safehouses, and shady opportunities.',
        sorcerer: 'A personal sanctum attuned to bloodline magic, experiments, and unpredictable power.',
        warlock: 'A veiled fane where pacts are honored, boons bargained, and signs interpreted.',
        wizard: 'A vast library for research, scribing, and the careful study of the arcane.'
    };

    static getClassFlavorDescription(flavor) {
        if (!flavor) return '';
        return this.CLASS_FLAVOR_DESCRIPTIONS[flavor] || '';
    }


    static STRONGHOLD_COSTS = {
        building: {
            'temple': 25000,
            'keep': 50000,
            'tower': 25000,
            'establishment': 10000
        },
        upgrading: {
            2: 10000,
            3: 25000,
            4: 50000,
            5: 100000
        }
    };

    static createStronghold(name, type, classFlavor = null, level = 1, description = '') {
        const buildingCost = this.STRONGHOLD_COSTS.building[type] || 0;
        return {
            id: foundry.utils.randomID(),
            name: name,
            type: type,
            classFlavor: classFlavor,
            level: Math.max(1, Math.min(5, level)),
            description: description,
            active: true,
            createdBy: game.user.id,
            createdDate: new Date().toISOString(),
            buildingCost: buildingCost,
            totalCostPaid: buildingCost,
            bonuses: []
        };
    }

    static getBuildingCost(type) {
        return this.STRONGHOLD_COSTS.building[type] || 0;
    }

    static getUpgradeCost(fromLevel, toLevel) {
        let totalCost = 0;
        for (let level = fromLevel + 1; level <= toLevel; level++) {
            totalCost += this.STRONGHOLD_COSTS.upgrading[level] || 0;
        }
        return totalCost;
    }

    static getTotalCostForLevel(type, level) {
        const buildingCost = this.getBuildingCost(type);
        const upgradeCost = this.getUpgradeCost(1, level);
        return buildingCost + upgradeCost;
    }

    static addBonus(strongholdId, bonus) {
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

    static removeBonus(strongholdId, bonusId) {
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        if (strongholds[strongholdId] && strongholds[strongholdId].bonuses) {
            strongholds[strongholdId].bonuses = strongholds[strongholdId].bonuses.filter(b => b.id !== bonusId);
            return game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
        }
        return Promise.resolve();
    }

    // D&D 5e Integration Methods
    static getApplicableBonuses(stronghold, actor) {
        if (!actor) return [];

        const customBonuses = stronghold.bonuses || [];

        return customBonuses.filter(bonus => {
            // Party-wide bonuses apply to everyone
            if (bonus.partyWide) return true;

            // Class-specific bonuses need class matching
            if (!bonus.partyWide && stronghold.classFlavor) {
                return this.actorHasMatchingClass(actor, stronghold.classFlavor);
            }

            // Character-specific bonuses (not party-wide, no class flavor)
            return !bonus.partyWide;
        });
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

    static getCharacterLevel(actor) {
        if (!actor) return 1;

        // D&D 5e specific level detection
        if (game.system.id === 'dnd5e') {
            return actor.system?.details?.level || 1;
        }

        // Generic fallback
        return actor.system?.level || actor.system?.details?.level || 1;
    }

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

    static getCharacterName(actor) {
        return actor?.name || 'Unknown Character';
    }
}
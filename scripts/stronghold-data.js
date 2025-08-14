export class StrongholdData {
    static STRONGHOLD_TYPES = {
        TEMPLE: 'temple',
        KEEP: 'keep',
        TOWER: 'tower',
        ESTABLISHMENT: 'establishment'
    };

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
}
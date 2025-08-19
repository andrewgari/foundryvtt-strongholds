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

    // High-level mechanics summaries by stronghold type (concise, paraphrased)
    static TYPE_MECHANICS_SUMMARY = {
        keep: {
            demesne: [
                'Improved security and morale throughout the demesne; garrison presence discourages threats.',
                'Rapid mustering and supply for defenders during crises.',
                'Increases readiness of allied units stationed nearby.'
            ],
            actions: [
                'Drill Troops: Conduct training to improve a unit’s effectiveness for upcoming conflicts.',
                'Fortify Works: Improve defenses, repair breaches, or raise temporary works before a siege.',
                'Patrol & Recon: Send scouts to reveal threats, routes, or enemy dispositions.',
                'Rally Militia: Call on local levies to temporarily bolster forces.'
            ],
            notes: [
                'Suited to martial characters and warfare-oriented campaigns.'
            ]
        },
        temple: {
            demesne: [
                'Sanctuary and healing for allies; rites uplift the faithful.',
                'Consecrated ground deters profane threats and unrest.',
                'Divine authority improves goodwill among locals and pilgrims.'
            ],
            actions: [
                'Conduct Rites: Bestow blessings or omens on characters or units.',
                'Consecrate/Exorcise: Purify sites, remove blights, or repel malign influences.',
                'Petition the Faith: Leverage church networks for aid, supplies, or influence.'
            ],
            notes: [
                'Thematic fit for divine casters and holy orders.'
            ]
        },
        tower: {
            demesne: [
                'Hub of research and experimentation; apprentices, labs, and wards.',
                'Arcane protections safeguard the environs from magical threats.',
                'Access to esoteric materials and assistants for projects.'
            ],
            actions: [
                'Research & Scribing: Reduce time or cost to learn, scribe, or refine spells/rituals.',
                'Craft Arcana: Prepare scrolls, potions, or minor devices with improved reliability.',
                'Raise Wards: Establish temporary or situational magical defenses.'
            ],
            notes: [
                'Ideal for arcane casters and scholarly pursuits.'
            ]
        },
        establishment: {
            demesne: [
                'Generates income and connections through trade, events, and patronage.',
                'Network of informants surfaces rumors, jobs, and social leverage.',
                'Boosts prosperity and goodwill, improving local cooperation.'
            ],
            actions: [
                'Call in Favors: Convert goodwill into aid, introductions, or material support.',
                'Host Events: Raise renown, attract patrons, or calm tensions among factions.',
                'Broker Deals: Improve terms for procurement, contracts, or alliances.'
            ],
            notes: [
                'Great for face characters, intrigue, and resource play.'
            ]
        }
    };

    static getTypeMechanicsSummary(type) {
        return this.TYPE_MECHANICS_SUMMARY[type] || { demesne: [], actions: [], notes: [] };
    }

    // High-level mechanics summaries by class flavor (concise, paraphrased)
    static CLASS_MECHANICS_SUMMARY = {
        barbarian: {
            followers: 'Fierce retainers, skirmishers, and hardy scouts gravitate to your banner.',
            actions: [
                'Rally Warband: Stir warriors to a ferocious surge or swift pursuit.',
                'Trial of Mettle: Prove strength to gain the tribe’s support or intimidate rivals.'
            ],
            tables: [ 'Servitors (barbarian-themed allies and retainers)' ]
        },
        bard: {
            followers: 'Artists, heralds, and rumor-mongers expand your fame and influence.',
            actions: [
                'Command Performance: Inspire allies or sway the crowd’s mood decisively.',
                'Compose & Publicize: Convert renown into tangible favors over downtime.'
            ],
            tables: [ 'Servitors (performers, agents, and influential patrons)' ]
        },
        cleric: {
            followers: 'Acolytes, healers, and faithful lay clergy gather to serve.',
            actions: [
                'Divine Rites: Bless allies, sanctify ground, or oppose profane forces.',
                'Intercession: Seek signs or aid from your deity’s hierarchy.'
            ],
            tables: [ 'Divine Intervention (structured results and omens)' ]
        },
        druid: {
            followers: 'Wardens, herbalists, and beasts attend your circle’s call.',
            actions: [
                'Commune with Land: Learn of threats, resources, and seasonal shifts.',
                'Rally Wardens: Enlist beasts or circles to guard and guide.'
            ],
            tables: [ 'Servitors (natural allies and circles)' ]
        },
        fighter: {
            followers: 'Veteran soldiers, drill sergeants, and siege crews bolster your command.',
            actions: [
                'Drill & Discipline: Improve a unit’s readiness or cohesion before battle.',
                'Siege Readiness: Expedite fortification, engines, or supply lines.'
            ],
            tables: [ 'Servitors (martial units, engineers, captains)' ]
        },
        monk: {
            followers: 'Ascetics and martial adepts practice and teach under your guidance.',
            actions: [
                'Meditative Regimen: Restore focus; sharpen reflexes among adepts.',
                'Way of the Cloister: Intercede to resolve conflicts peaceably.'
            ],
            tables: [ 'Servitors (monastic adepts and allies)' ]
        },
        paladin: {
            followers: 'Squires, knights, and faithful retainers heed your oath.',
            actions: [
                'Oathbound Vigil: Inspire zeal, protect the weak, or bolster resolve.',
                'Sacred Muster: Call on allied orders for aid.'
            ],
            tables: [ 'Special Mounts (sacred or exemplar steeds)' ]
        },
        ranger: {
            followers: 'Trackers, scouts, and wardens secure the borders and wilds.',
            actions: [
                'Map & Harry: Chart safe routes, harry foes, or secure supply lines.',
                'Call of the Wilds: Enlist beasts or locals as guides and guards.'
            ],
            tables: [ 'Servitors (scouts, beasts, and wayfinders)' ]
        },
        rogue: {
            followers: 'Fixers, fences, and informants cultivate networks and opportunities.',
            actions: [
                'Pull Strings: Acquire illicit access, safehouses, or hush favors.',
                'Cover of Night: Arrange distractions, smuggling, or quiet exits.'
            ],
            tables: [ 'Servitors (contacts, crews, and cutpurses)' ]
        },
        sorcerer: {
            followers: 'Apprentices and attuned allies assist with volatile workings.',
            actions: [
                'Channel Lineage: Amplify a signature effect in a controlled setting.',
                'Sanctum Focus: Convert downtime into refined, reliable power.'
            ],
            tables: [ 'Servitors (bloodline-touched aids)' ]
        },
        warlock: {
            followers: 'Occultists and pact-sworn attendants manage signs and boons.',
            actions: [
                'Pact Observance: Seek counsel, omens, or temporary boons within bounds.',
                'Veil & Ward: Mask activities or bind an intrusion briefly.'
            ],
            tables: [ 'Servitors (cabalists and pact agents)' ]
        },
        wizard: {
            followers: 'Apprentices, scribes, and constructs sustain methodical study.',
            actions: [
                'Scriptorium: Compress time and cost to copy or prepare spellwork.',
                'Laboratory: Execute careful experiments with mitigated risk.'
            ],
            tables: [ 'Spell Customization (schools, materials, side-effects)' ]
        }
    };

    static getClassMechanicsSummary(flavor) {
        return this.CLASS_MECHANICS_SUMMARY[flavor] || { followers: '', actions: [], tables: [] };
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
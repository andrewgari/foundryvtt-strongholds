import { StrongholdData } from './stronghold-data.js';

export class StrongholdViewer extends Application {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'stronghold-viewer',
            title: 'Party Strongholds',
            template: 'modules/strongholds-and-followers/templates/stronghold-viewer.hbs',
            width: 700,
            height: 500,
            resizable: true
        });
    }

    async getData() {
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const activeStrongholds = Object.values(strongholds).filter(s => s.active);

        // Get the user's current character
        const userCharacter = game.user.character;
        const characterClasses = userCharacter ? StrongholdData.getCharacterClasses(userCharacter) : [];
        const characterLevel = userCharacter ? StrongholdData.getCharacterLevel(userCharacter) : 1;

        const strongholdsWithBonuses = activeStrongholds.map(stronghold => {
            const customBonuses = stronghold.bonuses || [];
            const applicableBonuses = userCharacter ?
                StrongholdData.getApplicableBonuses(stronghold, userCharacter) :
                customBonuses.filter(b => b.partyWide);

            const typeSummary = StrongholdData.getTypeMechanicsSummary(stronghold.type);
            const classSummary = stronghold.classFlavor ? StrongholdData.getClassMechanicsSummary(stronghold.classFlavor) : { followers: '', actions: [], tables: [] };
            const canUpgrade = (stronghold.level || 1) < 5;
            const upgradeCost = canUpgrade ? StrongholdData.getUpgradeCost(stronghold.level, stronghold.level + 1) : 0;

            // Short preview of key actions (type + class flavored), max 3
            const actionPreview = [
                ...(typeSummary?.actions || []),
                ...((classSummary && classSummary.actions) || [])
            ].filter(Boolean).slice(0, 3);

            return {
                ...stronghold,
                customBonuses: customBonuses,
                myBonuses: applicableBonuses,
                typeDescription: StrongholdData.getTypeDescription(stronghold.type),
                typeSummary,
                classSummary,
                classFlavorDisplay: stronghold.classFlavor ? StrongholdData.CLASS_FLAVOR_DISPLAY[stronghold.classFlavor] || stronghold.classFlavor : null,
                hasClassBonuses: stronghold.classFlavor &&
                    StrongholdData.actorHasMatchingClass(userCharacter, stronghold.classFlavor),
                canUpgrade,
                upgradeCost,
                actionPreview
            };
        });

        return {
            strongholds: strongholdsWithBonuses,
            hasStrongholds: activeStrongholds.length > 0,
            characterName: StrongholdData.getCharacterName(userCharacter),
            characterClasses: characterClasses,
            characterLevel: characterLevel,
            systemId: game.system.id,
            isGM: game.user.isGM
        };
    }

    activateListeners(html) {

        // Collapsible sections in bonus details
        html.find('.section-toggle').click((ev) => {
            const btn = ev.currentTarget;
            const body = btn.nextElementSibling;
            const icon = btn.querySelector('i');
            if (!body) return;
            const isHidden = body.style.display === 'none' || !body.style.display;
            body.style.display = isHidden ? 'block' : 'none';
            if (icon) icon.className = isHidden ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
        });

        super.activateListeners(html);

        html.find('.bonus-toggle').click(this._onToggleBonusView.bind(this));
        html.find('.refresh-bonuses').click(this._onRefreshBonuses.bind(this));
        html.find('.reload-clients').click(this._onReloadClients.bind(this));
    }

    _onToggleBonusView(event) {
        event.preventDefault();
        const strongholdId = event.currentTarget.dataset.strongholdId;
        const bonusSection = event.currentTarget.closest('.stronghold-item').querySelector('.bonus-details');
        const icon = event.currentTarget.querySelector('i');

        if (bonusSection.style.display === 'none' || !bonusSection.style.display) {
            bonusSection.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
        } else {
            bonusSection.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
        }
    }

    _onReloadClients(event) {
        event?.preventDefault?.();
        if (!game.user.isGM) return ui.notifications.warn('Only the GM can reload clients');
        if (game?.strongholds?.reloadAllClients) {
            game.strongholds.reloadAllClients();
        } else {
            ui.notifications.warn('Reload API not available');
        }
    }


    _onRefreshBonuses(event) {
        event.preventDefault();
        this.render();
        ui.notifications.info('Stronghold bonuses refreshed');
    }
}
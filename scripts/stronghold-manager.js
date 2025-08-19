import { StrongholdData } from './stronghold-data.js';

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
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const strongholdArray = Object.values(strongholds).map(stronghold => {
            const upgradeCost = stronghold.level < 5 ? 
                StrongholdData.getUpgradeCost(stronghold.level, stronghold.level + 1) : 0;
            const typeSummary = StrongholdData.getTypeMechanicsSummary(stronghold.type);
            const classSummary = stronghold.classFlavor ? StrongholdData.getClassMechanicsSummary(stronghold.classFlavor) : { followers: '', actions: [], tables: [] };
            return {
                ...stronghold,
                upgradeCost: upgradeCost,
                canUpgrade: stronghold.level < 5,
                totalValueCost: StrongholdData.getTotalCostForLevel(stronghold.type, stronghold.level),
                typeDescription: StrongholdData.getTypeDescription(stronghold.type),
                typeSummary,
                classSummary,
                classFlavorDisplay: stronghold.classFlavor ? StrongholdData.CLASS_FLAVOR_DISPLAY[stronghold.classFlavor] || stronghold.classFlavor : null
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

        html.find('.create-stronghold').click(this._onCreateStronghold.bind(this));
        html.find('.edit-stronghold').click(this._onEditStronghold.bind(this));
        html.find('.delete-stronghold').click(this._onDeleteStronghold.bind(this));
        html.find('.toggle-stronghold').click(this._onToggleStronghold.bind(this));
        html.find('.upgrade-stronghold').click(this._onUpgradeStronghold.bind(this));
        html.find('.add-bonus').click(this._onAddBonus.bind(this));
        html.find('.remove-bonus').click(this._onRemoveBonus.bind(this));
    }

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
                        const name = formData.get('name');
                        const type = formData.get('type');
                        const classFlavor = formData.get('classFlavor') || null;
                        const level = parseInt(formData.get('level')) || 1;
                        const description = formData.get('description') || '';

                        if (!name || !type) {
                            ui.notifications.error('Name and Type are required');
                            return;
                        }

                        await this._createStronghold(name, type, classFlavor, level, description);
                    }
                },
                cancel: {
                    label: 'Cancel'
                }
            },
            default: 'create'
        });

        dialog.render(true);
    }

    async _createStronghold(name, type, classFlavor, level, description) {
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const newStronghold = StrongholdData.createStronghold(name, type, classFlavor, level, description);
        
        strongholds[newStronghold.id] = newStronghold;
        await game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
        
        const cost = StrongholdData.getTotalCostForLevel(type, level);
        ui.notifications.info(`Created stronghold: ${name} (Cost: ${cost.toLocaleString()} gp)`);
        this.render();
    }

    async _onEditStronghold(event) {
        event.preventDefault();
        const strongholdId = event.currentTarget.dataset.strongholdId;
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const stronghold = strongholds[strongholdId];

        if (!stronghold) return;

        const dialog = new Dialog({
            title: `Edit ${stronghold.name}`,
            content: await renderTemplate('modules/strongholds-and-followers/templates/stronghold-form.hbs', {
                stronghold: stronghold,
                strongholdTypes: StrongholdData.STRONGHOLD_TYPES,
                classFlavors: StrongholdData.CLASS_FLAVORS,
                isEdit: true
            }),
            buttons: {
                save: {
                    label: 'Save',
                    callback: async (html) => {
                        const formData = new FormData(html.find('form')[0]);
                        const updates = {
                            name: formData.get('name'),
                            type: formData.get('type'),
                            classFlavor: formData.get('classFlavor') || null,
                            level: parseInt(formData.get('level')) || 1,
                            description: formData.get('description') || ''
                        };

                        if (!updates.name || !updates.type) {
                            ui.notifications.error('Name and Type are required');
                            return;
                        }

                        await this._updateStronghold(strongholdId, updates);
                    }
                },
                cancel: {
                    label: 'Cancel'
                }
            },
            default: 'save'
        });

        dialog.render(true);
    }

    async _updateStronghold(strongholdId, updates) {
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        
        if (strongholds[strongholdId]) {
            Object.assign(strongholds[strongholdId], updates);
            await game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
            
            ui.notifications.info(`Updated stronghold: ${updates.name}`);
            this.render();
        }
    }

    async _onDeleteStronghold(event) {
        event.preventDefault();
        const strongholdId = event.currentTarget.dataset.strongholdId;
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const stronghold = strongholds[strongholdId];

        if (!stronghold) return;

        const confirmed = await Dialog.confirm({
            title: 'Delete Stronghold',
            content: `<p>Are you sure you want to delete <strong>${stronghold.name}</strong>?</p><p>This action cannot be undone.</p>`
        });

        if (confirmed) {
            delete strongholds[strongholdId];
            await game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
            
            ui.notifications.info(`Deleted stronghold: ${stronghold.name}`);
            this.render();
        }
    }

    async _onToggleStronghold(event) {
        event.preventDefault();
        const strongholdId = event.currentTarget.dataset.strongholdId;
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const stronghold = strongholds[strongholdId];

        if (!stronghold) return;

        stronghold.active = !stronghold.active;
        await game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
        
        ui.notifications.info(`${stronghold.active ? 'Activated' : 'Deactivated'} stronghold: ${stronghold.name}`);
        this.render();
    }

    async _onUpgradeStronghold(event) {
        event.preventDefault();
        const strongholdId = event.currentTarget.dataset.strongholdId;
        const strongholds = game.settings.get('strongholds-and-followers', 'strongholds');
        const stronghold = strongholds[strongholdId];

        if (!stronghold || stronghold.level >= 5) return;

        const upgradeCost = StrongholdData.getUpgradeCost(stronghold.level, stronghold.level + 1);
        
        const confirmed = await Dialog.confirm({
            title: 'Upgrade Stronghold',
            content: `<p>Upgrade <strong>${stronghold.name}</strong> from Level ${stronghold.level} to Level ${stronghold.level + 1}?</p>
                      <p><strong>Cost: ${upgradeCost.toLocaleString()} gp</strong></p>`
        });

        if (confirmed) {
            stronghold.level += 1;
            stronghold.totalCostPaid += upgradeCost;
            await game.settings.set('strongholds-and-followers', 'strongholds', strongholds);
            
            ui.notifications.info(`Upgraded ${stronghold.name} to Level ${stronghold.level} (Cost: ${upgradeCost.toLocaleString()} gp)`);
            this.render();
        }
    }

    async _onAddBonus(event) {
        event.preventDefault();
        const strongholdId = event.currentTarget.dataset.strongholdId;
        
        const dialog = new Dialog({
            title: 'Add Custom Bonus',
            content: `
                <form>
                    <div class="form-group">
                        <label for="bonus-name">Bonus Name *</label>
                        <input type="text" id="bonus-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="bonus-description">Description *</label>
                        <textarea id="bonus-description" name="description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="partyWide"> Party-wide bonus
                        </label>
                    </div>
                </form>
            `,
            buttons: {
                add: {
                    label: 'Add Bonus',
                    callback: async (html) => {
                        const formData = new FormData(html.find('form')[0]);
                        const bonus = {
                            name: formData.get('name'),
                            description: formData.get('description'),
                            partyWide: formData.has('partyWide')
                        };

                        if (!bonus.name || !bonus.description) {
                            ui.notifications.error('Name and Description are required');
                            return;
                        }

                        await StrongholdData.addBonus(strongholdId, bonus);
                        ui.notifications.info('Bonus added successfully');
                        this.render();
                    }
                },
                cancel: {
                    label: 'Cancel'
                }
            },
            default: 'add'
        });

        dialog.render(true);
    }

    async _onRemoveBonus(event) {
        event.preventDefault();
        const strongholdId = event.currentTarget.dataset.strongholdId;
        const bonusId = event.currentTarget.dataset.bonusId;
        
        const confirmed = await Dialog.confirm({
            title: 'Remove Bonus',
            content: '<p>Are you sure you want to remove this bonus?</p>'
        });

        if (confirmed) {
            await StrongholdData.removeBonus(strongholdId, bonusId);
            ui.notifications.info('Bonus removed');
            this.render();
        }
    }
}
// Foundry VTT standard FormApplication (ApplicationV2-compatible)
function fvtt() { return (globalThis as any); }
const AppV2: any = fvtt().foundry?.applications?.api?.ApplicationV2 || fvtt().Application;

export class StrongholdsManagementApp extends AppV2 {
  static override DEFAULT_OPTIONS = {
    id: 'strongholds-mgmt',
    window: { title: 'Strongholds Management', icon: 'fas fa-cog' },
    position: { width: 700, height: 'auto' },
    classes: ['strongholds', 'management']
  };

  static override PARTS = {
    main: { template: 'modules/strongholds-and-followers/templates/strongholds-management.hbs' }
  };

  async _prepareContext(): Promise<any> {
    const g = fvtt().game;
    const settings = g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {};
    return { strongholds: settings, isGM: Boolean(g?.user?.isGM) };
  }

  activateListeners(html: JQuery): void {
    super.activateListeners?.(html);
    html.on('click', '[data-action="reload"]', () => {
      if (!fvtt().game?.user?.isGM) return fvtt().ui?.notifications?.warn?.('Only the GM can reload clients');
      fvtt().game?.socket?.emit?.('module.strongholds-and-followers', { action: 'reload' });
      fvtt().ui?.notifications?.info?.('Requested reload for all connected clients...');
    });
  }
}


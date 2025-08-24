// Foundry VTT standard Application using ApplicationV2 when available
function fvtt() { return (globalThis as any); }
const AppV2: any = fvtt().foundry?.applications?.api?.ApplicationV2 || fvtt().Application;

export class StrongholdViewerApp extends AppV2 {
  static override DEFAULT_OPTIONS = {
    id: 'stronghold-viewer',
    window: { title: 'Party Strongholds', icon: 'fas fa-castle' },
    position: { width: 720, height: 'auto' }
  };

  static override PARTS = {
    main: { template: 'modules/strongholds-and-followers/templates/stronghold-viewer.hbs' }
  };

  async _prepareContext(_options?: any): Promise<any> {
    const g = fvtt().game;
    const all = g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {};
    const strongholds = Object.values(all).filter((s: any) => s?.active);
    return {
      strongholds,
      hasStrongholds: strongholds.length > 0,
      characterName: g?.user?.character?.name ?? '',
      systemId: String(g?.system?.id ?? 'unknown'),
      isGM: Boolean(g?.user?.isGM)
    };
  }
}

export function openStrongholdViewer() {
  return new StrongholdViewerApp().render(true);
}


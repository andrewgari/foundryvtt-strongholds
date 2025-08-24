// Foundry VTT standard Handlebars-based Application with compatibility for V1 and V2
function fvtt() { return (globalThis as any); }
const api = fvtt().foundry?.applications?.api;
const AppV2: any = api?.ApplicationV2;
const HBAM: any = api?.HandlebarsApplicationMixin;

// Compose a base class that renders Handlebars in V2, or falls back safely for non-Foundry contexts
const Base: any = (HBAM && AppV2)
  ? HBAM(AppV2)
  : (fvtt().Application ?? class { render() { return this; } });

export class StrongholdViewerApp extends Base {
  // V2 API
  static override DEFAULT_OPTIONS = {
    id: 'stronghold-viewer',
    window: { title: 'Party Strongholds', icon: 'fas fa-castle' },
    position: { width: 720, height: 'auto' },
    classes: ['strongholds', 'viewer']
  };
  static override PARTS = {
    main: { template: 'modules/strongholds-and-followers/templates/stronghold-viewer.hbs' }
  };

  // V1 compatibility
  static get defaultOptions() {
    const opts = super.defaultOptions ?? {};
    const merge = fvtt().foundry?.utils?.mergeObject || fvtt().mergeObject;
    return merge(opts, {
      id: 'stronghold-viewer',
      title: 'Party Strongholds',
      template: 'modules/strongholds-and-followers/templates/stronghold-viewer.hbs',
      width: 720,
      classes: ['strongholds', 'viewer']
    });
  }

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

  // V1 compatibility
  async getData(): Promise<any> { return this._prepareContext?.() ?? {}; }
}

export function openStrongholdViewer() {
  return new StrongholdViewerApp().render(true);
}


// Foundry VTT standard FormApplication (ApplicationV2-compatible)
function fvtt() { return (globalThis as any); }
const api = fvtt().foundry?.applications?.api;
const AppV2: any = api?.ApplicationV2;
const HBAM: any = api?.HandlebarsApplicationMixin;
import { openStrongholdViewer } from './StrongholdViewerApp';

const Base: any = (HBAM && AppV2)
  ? HBAM(AppV2)
  : (fvtt().Application ?? class { render() { return this; } });

export class StrongholdsManagementApp extends Base {
  static override DEFAULT_OPTIONS = {
    id: 'strongholds-mgmt',
    window: { title: 'Strongholds Management', icon: 'fas fa-cog' },
    position: { width: 700, height: 'auto' },
    classes: ['strongholds', 'management']
  };

  static override PARTS = {
    main: { template: 'modules/strongholds-and-followers/templates/strongholds-management.hbs' }
  };

  static get defaultOptions() {
    const opts = super.defaultOptions ?? {};
    const merge = fvtt().foundry?.utils?.mergeObject || fvtt().mergeObject;
    return merge(opts, {
      id: 'strongholds-mgmt',
      title: 'Strongholds Management',
      template: 'modules/strongholds-and-followers/templates/strongholds-management.hbs',
      width: 700,
      classes: ['strongholds', 'management']
    });
  }

  async _prepareContext(): Promise<any> {
    const g = fvtt().game;
    const dict = g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {};
    const items = Object.entries(dict).map(([id, s]: [string, any]) => ({ id, name: s?.name ?? id, type: s?.type ?? '-', level: s?.level ?? 1, active: !!s?.active }));
    return { items, isGM: Boolean(g?.user?.isGM) };
  }

  async getData() { return this._prepareContext?.() ?? {}; }

  activateListeners(html: JQuery): void {
    super.activateListeners?.(html);
    html.on('click', '[data-action="reload"]', () => {
      if (!fvtt().game?.user?.isGM) return fvtt().ui?.notifications?.warn?.('Only the GM can reload clients');
      fvtt().game?.socket?.emit?.('module.strongholds-and-followers', { action: 'reload' });
      fvtt().ui?.notifications?.info?.('Requested reload for all connected clients...');
    });

    html.on('click', '[data-action="open-viewer"]', () => openStrongholdViewer());

    html.on('click', '[data-action="toggle-active"]', async (ev) => {
      const id = (ev.currentTarget as HTMLElement)?.dataset?.id;
      if (!id) return;
      const g = fvtt().game;
      if (!g?.user?.isGM) {
        return fvtt().ui?.notifications?.warn?.(
          g?.i18n?.localize?.('SAF.OnlyGMCanModify') ?? 'Only the GM can modify strongholds'
        );
      }
      const deepClone =
        fvtt().foundry?.utils?.deepClone ??
        fvtt().foundry?.utils?.duplicate ??
        ((x: any) => (typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x))));
      const dict = deepClone(g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {});
      if (!dict[id]) return;
      dict[id].active = !dict[id].active;
      try {
        await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
        this.render?.();
      } catch (err) {
        fvtt().ui?.notifications?.error?.(
          g?.i18n?.localize?.('SAF.UpdateFailed') ?? 'Failed to update stronghold state'
        );
        console.error(err);
      }
    });
  }
}


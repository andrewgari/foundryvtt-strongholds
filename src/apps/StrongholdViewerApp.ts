// Foundry VTT standard Handlebars-based Application with compatibility for V1 and V2
function fvtt() {
  return globalThis as any;
}
const api = fvtt().foundry?.applications?.api;
const AppV2: any = api?.ApplicationV2;
const HBAM: any = api?.HandlebarsApplicationMixin;
import { StrongholdData } from '../lib/StrongholdData';

// Compose a base class that renders Handlebars in V2, or falls back safely for non-Foundry contexts
const Base: any =
  HBAM && AppV2
    ? HBAM(AppV2)
    : (fvtt().Application ??
      class {
        render() {
          return this;
        }
      });

export class StrongholdViewerApp extends Base {
  // V2 API
  static DEFAULT_OPTIONS = {
    id: 'stronghold-viewer',
    window: { title: 'Party Strongholds', icon: 'fas fa-castle' },
    position: { width: 720, height: 'auto' },
    classes: ['strongholds', 'viewer'],
  };
  static PARTS = {
    main: { template: 'modules/strongholds-and-followers/templates/stronghold-viewer.hbs' },
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
      classes: ['strongholds', 'viewer'],
    });
  }

  async _prepareContext(_options?: any): Promise<any> {
    const g = fvtt().game;
    const all = g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {};
    const strongholds = Object.entries(all)
      .map(([id, s]: [string, any]) => ({ id, ...(s as any) }))
      .filter((s: any) => s?.active)
      .map((s: any) => {
        const level = Number(s.level ?? 1);
        const nextLevel = Math.min(5, level + 1);
        const nextUpgradeCost = level >= 5 ? 0 : StrongholdData.getUpgradeCost(level, level + 1);
        const subtypeDisplay = s?.classFlavor
          ? ((StrongholdData.CLASS_FLAVOR_DISPLAY as any)[s.classFlavor] ?? s.classFlavor)
          : '';
        const typeSummary = StrongholdData.getTypeMechanicsSummary(s.type);
        const flavorDesc = StrongholdData.getClassFlavorDescription(s.classFlavor ?? null);
        const fmt = (n: number) => {
          try {
            return new Intl.NumberFormat().format(Number(n ?? 0));
          } catch {
            return String(n ?? 0);
          }
        };
        const cap = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
        return {
          id: s.id,
          name: s.name,
          type: s.type,
          typeDisplay: cap(String(s.type ?? '')),
          subtype: s.classFlavor ?? '',
          subtypeDisplay,
          level,
          nextLevel,
          nextUpgradeCost,
          buildingCost: StrongholdData.getBuildingCost(s.type),
          buildingCostDisplay: fmt(StrongholdData.getBuildingCost(s.type)),
          totalCostPaid: Number(
            s.totalCostPaid ?? StrongholdData.getTotalCostForLevel(s.type, level),
          ),
          totalCostPaidDisplay: fmt(
            Number(s.totalCostPaid ?? StrongholdData.getTotalCostForLevel(s.type, level)),
          ),
          nextUpgradeCostDisplay: nextUpgradeCost ? fmt(nextUpgradeCost) : '',
          bonuses: Array.isArray(s.bonuses) ? s.bonuses : [],
          mechanics: typeSummary,
          flavorDescription: flavorDesc,
        };
      });
    return {
      strongholds,
      hasStrongholds: strongholds.length > 0,
      characterName: g?.user?.character?.name ?? '',
      systemId: String(g?.system?.id ?? 'unknown'),
      isGM: Boolean(g?.user?.isGM),
    };
  }

  // V1 compatibility
  async getData(): Promise<any> {
    return this._prepareContext?.() ?? {};
  }
}

export function openStrongholdViewer() {
  return new StrongholdViewerApp().render(true);
}

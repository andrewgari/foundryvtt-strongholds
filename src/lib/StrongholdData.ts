export type StrongholdType = 'temple' | 'keep' | 'tower' | 'establishment';
export type ClassFlavor =
  | 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter' | 'monk'
  | 'paladin' | 'ranger' | 'rogue' | 'sorcerer' | 'warlock' | 'wizard';

export interface StrongholdBonus {
  id: string;
  name: string;
  description: string;
  partyWide: boolean;
  addedDate: string;
}

export interface Stronghold {
  id: string;
  name: string;
  type: StrongholdType;
  classFlavor: ClassFlavor | null;
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
  active: boolean;
  createdBy: string;
  createdDate: string;
  buildingCost: number;
  totalCostPaid: number;
  bonuses: StrongholdBonus[];
}

export interface CostConfig {
  building: Record<StrongholdType, number>;
  upgrading: Record<2 | 3 | 4 | 5, number>;
}

// Lightweight Foundry helpers (avoid any when possible)
const F = {
  settings: () => (globalThis as any).game?.settings,
  user: () => (globalThis as any).game?.user,
  system: () => (globalThis as any).game?.system,
};

export class StrongholdData {
  static readonly STRONGHOLD_TYPES: StrongholdType[] = [
    'temple', 'keep', 'tower', 'establishment'
  ];

  static readonly STRONGHOLD_COSTS: CostConfig = {
    building: { temple: 25000, keep: 50000, tower: 25000, establishment: 10000 },
    upgrading: { 2: 10000, 3: 25000, 4: 50000, 5: 100000 }
  };

  static getCostConfig(): CostConfig {
    const defaults = this.STRONGHOLD_COSTS;
    const buildingOverride = (F.settings()?.get('strongholds-and-followers', 'buildingCosts') ?? {}) as Partial<CostConfig['building']>;
    const upgradeOverride = (F.settings()?.get('strongholds-and-followers', 'upgradeCosts') ?? {}) as Partial<CostConfig['upgrading']>;
    return {
      building: { ...defaults.building, ...(buildingOverride as Record<StrongholdType, number>) },
      upgrading: { ...defaults.upgrading, ...(upgradeOverride as Record<2|3|4|5, number>) }
    };
  }

  static createStronghold(
    name: string,
    type: StrongholdType,
    classFlavor: ClassFlavor | null = null,
    level: number = 1,
    description = ''
  ): Stronghold {
    const buildingCost = this.getBuildingCost(type);
    const clamp = (n: number) => (Math.max(1, Math.min(5, Math.floor(n))) as 1|2|3|4|5);
    const id = (globalThis as any).foundry?.utils?.randomID?.() ?? crypto.randomUUID?.() ?? `${Date.now()}`;
    return {
      id,
      name,
      type,
      classFlavor,
      level: clamp(level),
      description,
      active: true,
      createdBy: F.user()?.id ?? 'unknown',
      createdDate: new Date().toISOString(),
      buildingCost,
      totalCostPaid: buildingCost,
      bonuses: []
    };
  }

  static getBuildingCost(type: StrongholdType): number {
    const cfg = this.getCostConfig();
    return cfg.building[type] ?? 0;
  }

  static getUpgradeCost(fromLevel: number, toLevel: number): number {
    const cfg = this.getCostConfig();
    let total = 0;
    for (let lvl = Math.max(2, fromLevel + 1); lvl <= Math.max(2, toLevel); lvl++) {
      const k = Math.max(2, Math.min(5, lvl)) as 2|3|4|5;
      total += cfg.upgrading[k] ?? 0;
    }
    return total;
  }

  static getTotalCostForLevel(type: StrongholdType, level: number): number {
    return this.getBuildingCost(type) + this.getUpgradeCost(1, level);
  }

  static addBonus(strongholds: Record<string, Stronghold>, strongholdId: string, bonus: Omit<StrongholdBonus, 'id' | 'addedDate'>): Record<string, Stronghold> {
    const target = strongholds[strongholdId];
    if (!target) return strongholds;
    const id = (globalThis as any).foundry?.utils?.randomID?.() ?? crypto.randomUUID?.() ?? `${Date.now()}`;
    const b: StrongholdBonus = { id, addedDate: new Date().toISOString(), ...bonus };
    target.bonuses = [...(target.bonuses ?? []), b];
    return { ...strongholds, [strongholdId]: { ...target } };
  }

  static removeBonus(strongholds: Record<string, Stronghold>, strongholdId: string, bonusId: string): Record<string, Stronghold> {
    const target = strongholds[strongholdId];
    if (!target) return strongholds;
    target.bonuses = (target.bonuses ?? []).filter(b => b.id !== bonusId);
    return { ...strongholds, [strongholdId]: { ...target } };
  }

  static getCharacterName(actor: any): string { return actor?.name ?? 'Unknown Character'; }

  static getCharacterLevel(actor: any): number {
    if (!actor) return 1;
    if (F.system()?.id === 'dnd5e') return actor.system?.details?.level ?? 1;
    return actor.system?.level ?? actor.system?.details?.level ?? 1;
  }

  static getCharacterClasses(actor: any): string[] {
    if (!actor) return [];
    if (F.system()?.id === 'dnd5e') return Object.keys(actor.classes ?? {});
    const cls = actor.system?.details?.class;
    return cls ? [String(cls)] : [];
  }

  static actorHasMatchingClass(actor: any, classFlavor: ClassFlavor): boolean {
    if (!actor || !classFlavor) return false;
    if (F.system()?.id === 'dnd5e') {
      const classes = actor.classes ?? {};
      return Object.keys(classes).some((c) => c.toLowerCase() === classFlavor.toLowerCase());
    }
    const t = actor.type?.toLowerCase?.() ?? '';
    const c = actor.system?.details?.class?.toLowerCase?.() ?? '';
    const fl = classFlavor.toLowerCase();
    return t === fl || c === fl;
  }

  static getApplicableBonuses(stronghold: Stronghold, actor: any): StrongholdBonus[] {
    if (!actor) return [];
    const custom = stronghold.bonuses ?? [];
    return custom.filter((b) => b.partyWide || (!!stronghold.classFlavor && this.actorHasMatchingClass(actor, stronghold.classFlavor)) || (!b.partyWide && !stronghold.classFlavor));
  }
}


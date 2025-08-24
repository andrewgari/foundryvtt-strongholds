<script lang="ts">
  import { onMount } from 'svelte';
  import { StrongholdData, type Stronghold, type ClassFlavor, type StrongholdType } from '../lib/StrongholdData';

  type ViewModel = {
    strongholds: Array<Stronghold & {
      customBonuses: Stronghold['bonuses'];
      myBonuses: Stronghold['bonuses'];
      typeDescription: string;
      typeSummary: ReturnType<typeof StrongholdData.getTypeMechanicsSummary>;
      classSummary: ReturnType<typeof StrongholdData.getClassMechanicsSummary>;
      classFlavorDisplay: string | null;
      hasClassBonuses: boolean;
      canUpgrade: boolean;
      upgradeCost: number;
      actionPreview: string[];
    }>;
    hasStrongholds: boolean;
    characterName: string;
    characterClasses: string[];
    characterLevel: number;
    systemId: string;
    isGM: boolean;
  };

  let vm: ViewModel = {
    strongholds: [], hasStrongholds: false,
    characterName: '', characterClasses: [], characterLevel: 1,
    systemId: 'unknown', isGM: false
  };

  function getGame(): any { return (globalThis as any).game; }
  function getUI(): any { return (globalThis as any).ui; }

  async function refresh() {
    const game = getGame();
    const strongholds = game.settings.get('strongholds-and-followers', 'strongholds') ?? {};
    const activeStrongholds = Object.values(strongholds).filter((s: any) => s.active);

    const userCharacter = game.user?.character ?? null;
    const characterClasses = userCharacter ? StrongholdData.getCharacterClasses(userCharacter) : [];
    const characterLevel = userCharacter ? StrongholdData.getCharacterLevel(userCharacter) : 1;

    const strongholdsWith = activeStrongholds.map((sh: Stronghold) => {
      const customBonuses = sh.bonuses ?? [];
      const applicable = userCharacter
        ? StrongholdData.getApplicableBonuses(sh, userCharacter)
        : customBonuses.filter((b) => b.partyWide);

      const typeSummary = StrongholdData.getTypeMechanicsSummary(sh.type);
      const classSummary = sh.classFlavor ? StrongholdData.getClassMechanicsSummary(sh.classFlavor as ClassFlavor) : { followers: '', actions: [], tables: [] };
      const canUpgrade = (sh.level || 1) < 5;
      const upgradeCost = canUpgrade ? StrongholdData.getUpgradeCost(sh.level, sh.level + 1) : 0;

      const actionPreview = [...(typeSummary?.actions ?? []), ...(classSummary?.actions ?? [])].filter(Boolean).slice(0, 3);

      return {
        ...sh,
        customBonuses,
        myBonuses: applicable,
        typeDescription: StrongholdData.getTypeDescription(sh.type as StrongholdType),
        typeSummary,
        classSummary,
        classFlavorDisplay: sh.classFlavor ? (StrongholdData.CLASS_FLAVOR_DISPLAY as any)[sh.classFlavor] ?? sh.classFlavor : null,
        hasClassBonuses: Boolean(sh.classFlavor && StrongholdData.actorHasMatchingClass(userCharacter, sh.classFlavor as ClassFlavor)),
        canUpgrade,
        upgradeCost,
        actionPreview
      };
    });

    vm = {
      strongholds: strongholdsWith,
      hasStrongholds: activeStrongholds.length > 0,
      characterName: StrongholdData.getCharacterName(userCharacter),
      characterClasses,
      characterLevel,
      systemId: String(game.system?.id ?? 'unknown'),
      isGM: Boolean(game.user?.isGM)
    };
  }

  function reloadClients() {
    const game = getGame();
    const ui = getUI();
    if (!game.user?.isGM) return ui?.notifications?.warn?.('Only the GM can reload clients');
    try {
      game.socket?.emit?.('module.strongholds-and-followers', { action: 'reload' });
      ui?.notifications?.info?.('Requested reload for all connected clients...');
    } catch (e) {
      console.error('Strongholds | Failed to emit reload', e);
      ui?.notifications?.error?.('Failed to request reload');
    }
  }

  function toggleBonusView(ev: Event) {
    const btn = ev.currentTarget as HTMLButtonElement | null;
    const item = btn?.closest('.stronghold-item');
    const section = item?.querySelector<HTMLElement>('.bonus-details');
    const icon = btn?.querySelector('i');
    if (!section || !icon) return;
    const visible = section.style.display !== 'none' && section.style.display !== '' ? true : false;
    if (visible) { section.style.display = 'none'; icon.className = 'fas fa-chevron-down'; }
    else { section.style.display = 'block'; icon.className = 'fas fa-chevron-up'; }
  }

  function sectionToggle(ev: Event) {
    const btn = ev.currentTarget as HTMLButtonElement | null;
    const body = btn?.nextElementSibling as HTMLElement | null;
    const icon = btn?.querySelector('i');
    if (!body || !icon) return;
    const isHidden = body.style.display === 'none' || !body.style.display;
    body.style.display = isHidden ? 'block' : 'none';
    icon.className = isHidden ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
  }

  onMount(() => { refresh(); });
</script>

<section class="stronghold-viewer">
  <div class="viewer-header">
    <h2><i class="fas fa-castle"></i> Party Strongholds</h2>
    <div class="header-actions">
      {#if vm.isGM}
        <button class="reload-clients" aria-label="Reload all clients" on:click|preventDefault={reloadClients} title="Reload all connected clients">
          <i class="fas fa-bolt" aria-hidden="true"></i>
        </button>
      {/if}
      <button class="refresh-bonuses" aria-label="Refresh" on:click|preventDefault={refresh} title="Refresh stronghold data">
        <i class="fas fa-sync-alt" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  {#if vm.hasStrongholds}
    <div class="character-info">
      <p><strong>Character:</strong> {vm.characterName}</p>
      {#if vm.characterClasses.length}
        <p><strong>Classes:</strong> {vm.characterClasses.join(', ')} (Level {vm.characterLevel})</p>
      {/if}
      {#if vm.systemId === 'dnd5e'}
        <p><em>Showing D&D 5e stronghold bonuses applicable during extended rests</em></p>
      {:else}
        <p><em>System: {vm.systemId} - Some features may require D&D 5e system</em></p>
      {/if}
    </div>

    <div class="strongholds-list">
      {#each vm.strongholds as sh}
        <div class="stronghold-item type-{sh.type}">
          <div class="stronghold-header">
            <div class="stronghold-title">
              <h3>{sh.name}</h3>
              <div class="stronghold-meta">
                <span class="stronghold-type">{sh.type}</span>
                {#if sh.classFlavor}
                  <span class="stronghold-class">{sh.classFlavorDisplay ?? sh.classFlavor}</span>
                {/if}
                <span class="stronghold-level">Level {sh.level}</span>
              </div>
            </div>
            <button class="bonus-toggle" aria-label="Toggle details" on:click|preventDefault={toggleBonusView} title="Show details">
              <i class="fas fa-chevron-down"></i>
            </button>
          </div>

          <div class="stronghold-summary">
            <table class="sg-table sg-table--compact sg-table--striped">
              <thead>
                <tr>
                  <th><i class="fas fa-chess-rook"></i> Type</th>
                  <th><i class="fas fa-hat-wizard"></i> Class</th>
                  <th><i class="fas fa-signal"></i> Level</th>
                  <th><i class="fas fa-user-friends"></i> Followers</th>
                  <th><i class="fas fa-coins"></i> Total Value</th>
                  <th><i class="fas fa-toggle-on"></i> Active</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{sh.type}</td>
                  <td>{sh.classFlavorDisplay ?? (sh.classFlavor ?? '—')}</td>
                  <td class="cell-num">{sh.level} / 5</td>
                  <td>{sh.classSummary.followers || '—'}</td>
                  <td class="cell-num">{sh.totalCostPaid ? sh.totalCostPaid.toLocaleString() + ' gp' : '—'}</td>
                  <td class="cell-num"><i class="fas fa-check-circle" title="Active"></i></td>
                </tr>
                {#if sh.description}
                  <tr class="row-note"><td colspan="6" class="cell-note">{sh.description}</td></tr>
                {/if}
                {#if sh.typeDescription}
                  <tr class="row-note"><td colspan="6" class="cell-note"><em>{sh.typeDescription}</em></td></tr>
                {/if}
              </tbody>
            </table>

            {#if sh.classFlavorDisplay}
              <div class="class-flavor-summary">
                <span class="class-flavor-badge" title="Class Flavor"><i class="fas fa-hat-wizard"></i> {sh.classFlavorDisplay}</span>
                {#if StrongholdData.getClassFlavorDescription(sh.classFlavor as ClassFlavor)}
                  <p class="class-flavor-text">{StrongholdData.getClassFlavorDescription(sh.classFlavor as ClassFlavor)}</p>
                {/if}
              </div>
            {/if}

            {#if sh.actionPreview?.length}
              <div class="action-preview">
                {#each sh.actionPreview as act}
                  <span class="action-chip" title="Stronghold action">{act}</span>
                {/each}
              </div>
            {/if}
          </div>

          <div class="bonus-summary">
            {#if sh.customBonuses?.length}
              <p><strong>{sh.customBonuses.length} custom bonus{sh.customBonuses.length === 1 ? '' : 'es'} available</strong></p>
              {#if sh.hasClassBonuses}
                <p class="class-bonus-note"><i class="fas fa-star"></i> Includes class-flavored stronghold {#if sh.classFlavorDisplay}— <em>{sh.classFlavorDisplay}</em>{/if}</p>
              {/if}
            {:else}
              <p class="no-bonuses">No custom bonuses have been added yet</p>
            {/if}
          </div>

          <div class="bonus-details" style="display: none;">
            <div class="collapsible">
              <button class="section-toggle" on:click|preventDefault={sectionToggle} type="button"><i class="fas fa-chevron-right"></i> Mechanics</button>
              <div class="section-body" style="display: none;">
                {#if sh.typeSummary}
                  <div class="mechanics-block type-summary">
                    <table class="sg-table sg-table--compact sg-table--striped">
                      <thead>
                        <tr><th colspan="2"><i class="fas fa-globe"></i> Demesne Effects</th></tr>
                      </thead>
                      <tbody>
                        {#each sh.typeSummary.demesne as d}<tr><td colspan="2">{d}</td></tr>{/each}
                        <tr><th colspan="2"><i class="fas fa-fist-raised"></i> Stronghold Actions</th></tr>
                        {#each sh.typeSummary.actions as a}<tr><td colspan="2">{a}</td></tr>{/each}
                      </tbody>
                    </table>
                  </div>
                {/if}

                {#if sh.classSummary}
                  <div class="mechanics-block class-summary">
                    <table class="sg-table sg-table--compact sg-table--striped">
                      <tbody>
                        {#if sh.classSummary.followers}
                          <tr><th style="width: 180px"><i class="fas fa-user-friends"></i> Followers</th><td>{sh.classSummary.followers}</td></tr>
                        {/if}
                        {#if sh.classSummary.actions?.length}
                          <tr><th colspan="2"><i class="fas fa-bolt"></i> Class Actions</th></tr>
                          {#each sh.classSummary.actions as ca}<tr><td colspan="2">{ca}</td></tr>{/each}
                        {/if}
                        {#if sh.classSummary.tables?.length}
                          <tr><th colspan="2"><i class="fas fa-table"></i> Tables</th></tr>
                          {#each sh.classSummary.tables as t}<tr><td colspan="2">{t}</td></tr>{/each}
                        {/if}
                      </tbody>
                    </table>
                  </div>
                {/if}
              </div>
            </div>

            <div class="collapsible">
              <button class="section-toggle" on:click|preventDefault={sectionToggle} type="button"><i class="fas fa-chevron-right"></i> Custom Bonuses</button>
              <div class="section-body" style="display: none;">
                {#if sh.customBonuses?.length}
                  <table class="sg-table sg-table--compact sg-table--striped">
                    <thead><tr><th>Bonus</th><th>Type</th></tr></thead>
                    <tbody>
                      {#each sh.customBonuses as b}
                        <tr>
                          <td><strong>{b.name}</strong><div class="cell-note">{b.description}</div></td>
                          <td>{#if b.partyWide}<span class="party-bonus"><i class="fas fa-users"></i> Party-wide</span>{:else}<span class="class-bonus"><i class="fas fa-user"></i> Character-specific</span>{/if}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                {:else}
                  <p class="no-custom-bonuses">No custom bonuses have been added by the GM yet.</p>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="extended-rest-info">
      <div class="info-box">
        <h4><i class="fas fa-bed"></i> Extended Rest Bonuses</h4>
        <p>These bonuses are applied automatically when you complete an extended rest (if auto-apply is enabled).</p>
        <p><strong>Party-wide bonuses</strong> apply to all characters, while <strong>class-specific bonuses</strong> only apply to matching classes.</p>
      </div>
    </div>
  {:else}
    <div class="no-strongholds">
      <div class="empty-state">
        <i class="fas fa-castle fa-3x"></i>
        <h3>No Active Strongholds</h3>
        <p>Your party doesn't have any active strongholds yet.</p>
        <p>Ask your GM to create and activate strongholds to gain bonuses during extended rests.</p>
      </div>
    </div>
  {/if}
</section>

<style lang="scss">
.stronghold-viewer { color: var(--color-text-dark-primary); }
.character-info { background: var(--color-bg-option); padding: 1rem; border-radius: 6px; margin-bottom: 1rem; border-left: 4px solid var(--stronghold-accent); }
.viewer-header { display:flex; justify-content: space-between; align-items:center; margin-bottom:1rem; padding-bottom:.5rem; border-bottom:2px solid var(--color-border-dark); }
.stronghold-item { --stronghold-accent: var(--color-border-highlight); background: var(--color-bg-option); border: 1px solid var(--color-border-light); border-radius: 8px; margin-bottom: 1rem; padding: 1rem; }
.type-temple { --stronghold-accent: var(--color-text-highlight); }
.type-keep { --stronghold-accent: var(--color-border-highlight); }
.type-tower { --stronghold-accent: var(--color-border-dark); }
.type-establishment { --stronghold-accent: var(--color-border-light-primary, var(--color-border-light)); }

.stronghold-title { flex-grow: 1; }
.stronghold-meta { display:flex; gap:.5rem; margin-top:.375rem; font-size:.95rem; color: var(--color-text-dark-secondary); }
.stronghold-type { border: 1px solid var(--stronghold-accent); color: var(--color-text-dark-primary); background: color-mix(in srgb, var(--stronghold-accent) 12%, transparent); padding: 0 .5rem; border-radius: 3px; }
.stronghold-level { background: var(--stronghold-accent); color: var(--color-text-light-primary, #fff); padding: 0 .5rem; border-radius: 3px; }
.stronghold-class { border: 1px solid var(--color-text-highlight); background: color-mix(in srgb, var(--color-text-highlight) 12%, transparent); color: var(--color-text-dark-primary); padding: 0 .5rem; border-radius: 999px; font-weight: 700; }
.bonus-toggle { background: var(--color-bg-option); border: 1px solid var(--stronghold-accent); padding:.5rem; border-radius: 999px; cursor:pointer; }
.bonus-toggle:hover { background: color-mix(in srgb, var(--stronghold-accent) 12%, transparent); }

.sg-table { width:100%; border-collapse: separate; border-spacing: 0; background: var(--color-bg-option); border: 1px solid var(--color-border-light); border-radius: 6px; overflow: hidden; }
.sg-table th, .sg-table td { padding: .5rem .6rem; border-right: 1px solid var(--color-border-light); border-bottom: 1px solid var(--color-border-light); }
.sg-table th { background: var(--color-bg-secondary); color: var(--color-text-dark-primary); font-weight:700; text-align:left; }
.sg-table tr:last-child td { border-bottom: 0; }
.sg-table tr td:last-child, .sg-table tr th:last-child { border-right: 0; }
.sg-table--compact th, .sg-table--compact td { padding: .35rem .5rem; font-size: .95rem; }
.sg-table--striped tbody tr:nth-child(odd) { background: color-mix(in srgb, var(--color-bg-option) 92%, transparent); }
.cell-num { text-align:right; font-variant-numeric: tabular-nums; font-weight: 600; }
.cell-note { color: var(--color-text-dark-secondary); font-style: italic; }

.class-flavor-summary { margin-top:.5rem; padding:.5rem .75rem; border-left:3px solid var(--stronghold-accent); background: color-mix(in srgb, var(--stronghold-accent) 8%, transparent); border-radius: 4px; }
.class-bonus-note { color: var(--color-text-highlight); font-weight: bold; }
.action-preview { display:flex; flex-wrap:wrap; gap:.25rem; margin-top:.5rem; }
.action-chip { background: color-mix(in srgb, var(--stronghold-accent) 10%, var(--color-bg-secondary)); border: 1px solid var(--stronghold-accent); border-radius: 999px; padding: .125rem .5rem; font-size: .8rem; font-weight: 600; }

.bonus-details { border-top: 1px solid var(--color-border-light); padding-top: 1rem; margin-top: 1rem; }
.no-bonuses, .no-strongholds { text-align:center; font-style: italic; color: var(--color-text-dark-secondary); }
</style>


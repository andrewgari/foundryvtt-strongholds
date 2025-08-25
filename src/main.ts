import './styles/main.scss';
import { StrongholdsManagementApp } from './apps/StrongholdsManagementApp';
import { openStrongholdViewer } from './apps/StrongholdViewerApp';

// Boot diagnostics
console.log('[Strongholds] main loaded');
(Hooks as any)?.once?.('ready', () => console.log('[Strongholds] ready'));

// As a last-resort safety net, delegate clicks globally in case Foundry doesn't wire tool onClick
Hooks.once('ready', () => {
  try {
    const flag = '__sh_global_bound__';
    if ((document.body as any)[flag]) return;
    document.body.addEventListener(
      'click',
      (ev: Event) => {
        try {
          const t = ev.target as Element | null;
          const toolEl = t?.closest?.('[data-tool]') as HTMLElement | null;
          if (!toolEl) return;
          const tool = toolEl.dataset?.tool;
          if (tool === 'view') {
            console.log('[Strongholds] global click fallback -> view');
            return onToolbarViewClick();
          }
          if (tool === 'manage') {
            console.log('[Strongholds] global click fallback -> manage');
            return onToolbarManageClick();
          }
        } catch (e) {
          console.error('[Strongholds] global click fallback error', e);
        }
      },
      { passive: true, capture: true } as any,
    );
    (document.body as any)[flag] = true;
    console.log('[Strongholds] global click fallback bound');
  } catch (e) {
    console.error('[Strongholds] failed to bind global click fallback', e);
  }
});

// Extra global capture fallback specifically for the management three-dots menu
Hooks.once('ready', () => {
  try {
    const flag = '__sh_menu_global__';
    if ((document.body as any)[flag]) return;
    document.body.addEventListener(
      'click',
      (ev: Event) => {
        try {
          const t = ev.target as Element | null;
          const container = t?.closest?.('.menu-trigger, .row-menu') as HTMLElement | null;
          if (!container) return;
          const trigger = container.classList.contains('menu-trigger')
            ? container
            : (container.querySelector?.('.menu-trigger') as HTMLElement | null);
          if (!trigger) return;
          console.log('[Strongholds] (global) menu-trigger clicked');
          const id = trigger.dataset.menuId;
          const esc =
            (globalThis as any).CSS?.escape ??
            ((s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'));
          let menu = (id ? document.querySelector?.(`#${esc(id)}`) : null) as HTMLElement | null;
          // Fallback: try to find sibling context-menu within the same row-menu cell
          if (!menu) {
            const cell = container.closest?.('.row-menu') as HTMLElement | null;
            menu = cell?.querySelector?.('.context-menu') as HTMLElement | null;
          }
          if (!menu) {
            console.warn('[Strongholds] (global) menu not found for trigger', { id });
            return;
          }
          // Close any open menus
          document.querySelectorAll?.('.context-menu')?.forEach((m: any) => {
            (m as HTMLElement).hidden = true;
            (m as HTMLElement).style.display = 'none';
          });
          document
            .querySelectorAll?.('.menu-trigger[aria-expanded="true"]')
            ?.forEach((m: any) => (m as HTMLElement).setAttribute('aria-expanded', 'false'));
          // Toggle this one
          const open = !menu.hidden;
          if (!open) {
            menu.hidden = false;
            try {
              menu.removeAttribute('hidden');
            } catch {}
            (menu.style as any).display = 'block';
            try {
              (menu.style as any).zIndex = '2147483647';
            } catch {}
            try {
              if (menu.parentElement !== document.body) document.body.appendChild(menu);
            } catch {}
            trigger.setAttribute('aria-expanded', 'true');
            const r = trigger.getBoundingClientRect();
            Object.assign(menu.style, {
              position: 'fixed',
              top: `${Math.round(r.top + trigger.offsetHeight + 4)}px`,
              left: `${Math.round(r.left)}px`,
              zIndex: '9999',
            });
            try {
              (globalThis as any).__sh_menu_last_open__ = performance.now?.() ?? Date.now();
            } catch {}
          }
        } catch (e) {
          console.error('[Strongholds] global menu-trigger handler error', e);
        }
      },
      { passive: true, capture: true } as any,
    );
    (document.body as any)[flag] = true;
  } catch (e) {
    console.error('[Strongholds] failed to bind global menu handler', e);
  }
});

// Global delegated handler for actions clicked inside a reparented context menu
Hooks.once('ready', () => {
  try {
    const flag = '__sh_menu_actions_global__';
    if ((document.body as any)[flag]) return;
    document.body.addEventListener(
      'click',
      (ev: Event) => {
        try {
          const t = ev.target as Element | null;
          const btn = t?.closest?.('.context-menu [data-action]') as HTMLElement | null;
          if (!btn) return;
          const menu = btn.closest('.context-menu') as HTMLElement | null;
          const appId = menu?.getAttribute('data-app-id') || 'strongholds-mgmt';
          const app = (StrongholdsManagementApp as any).instances?.[appId] as
            | StrongholdsManagementApp
            | undefined;
          if (!app) return;
          const action = btn.dataset.action;
          const id = btn.dataset.id!;
          console.log('[Strongholds] (global) action click', { appId, action, id });
          switch (action) {
            case 'create':
              return (app as any)._openCreateDialog?.();
            case 'edit':
              return id ? (app as any)._openEditDialog?.(id) : undefined;
            case 'upgrade':
              return id ? (app as any)._upgradeStronghold?.(id) : undefined;
            case 'delete':
              return id ? (app as any)._deleteStronghold?.(id) : undefined;
            case 'toggle-active':
              return (async () => {
                if (!id) return;
                const g: any = (globalThis as any).game;
                if (!g?.user?.isGM)
                  return (globalThis as any).ui?.notifications?.warn?.(
                    g?.i18n?.localize?.('SAF.OnlyGMCanModify') ??
                      'Only the GM can modify strongholds',
                  );
                const deepClone =
                  (globalThis as any).foundry?.utils?.deepClone ??
                  ((x: any) => JSON.parse(JSON.stringify(x)));
                const dict = deepClone(
                  g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {},
                );
                if (!dict[id]) return;
                dict[id].active = !dict[id].active;
                await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
                (app as any).render?.();
              })();
          }
        } catch (e) {
          console.error('[Strongholds] global actions handler error', e);
        }
      },
      { passive: true, capture: true } as any,
    );
    (document.body as any)[flag] = true;
  } catch (e) {
    console.error('[Strongholds] failed to bind global actions handler', e);
  }
});

// Register module settings so apps can read/write strongholds data
Hooks.once('init', () => {
  const g: any = (globalThis as any).game;
  try {
    console.log('[Strongholds] init hook');
    const settings = g?.settings;
    if (settings) {
      // Core data store
      if (!settings.settings.has('strongholds-and-followers.strongholds')) {
        settings.register('strongholds-and-followers', 'strongholds', {
          scope: 'world',
          config: false,
          type: Object,
          default: {},
        });
        console.log('[Strongholds] registered setting: strongholds');
      }
      // Cost overrides used by StrongholdData.getCostConfig()
      if (!settings.settings.has('strongholds-and-followers.buildingCosts')) {
        settings.register('strongholds-and-followers', 'buildingCosts', {
          scope: 'world',
          config: false,
          type: Object,
          default: {},
        });
        console.log('[Strongholds] registered setting: buildingCosts');
      }
      if (!settings.settings.has('strongholds-and-followers.upgradeCosts')) {
        settings.register('strongholds-and-followers', 'upgradeCosts', {
          scope: 'world',
          config: false,
          type: Object,
          default: {},
        });
        console.log('[Strongholds] registered setting: upgradeCosts');
      }
    }
  } catch (e) {
    console.error('[Strongholds] init error', e);
  }
});

// Strongholds toolbar handlers (module-scope so we can bind via DOM as a fallback)
function onToolbarViewClick() {
  try {
    console.log('[Strongholds] toolbar view clicked');
    openStrongholdViewer();
  } catch (e) {
    console.error('[Strongholds] view click error', e);
  }
}

function onToolbarManageClick() {
  try {
    console.log('[Strongholds] toolbar manage clicked - creating app');
    new StrongholdsManagementApp().render(true);
  } catch (e) {
    console.error('[Strongholds] manage click error', e);
  }
}

function buildStrongholdsControlArray() {
  const isGM = (globalThis as any).game?.user?.isGM;
  const strongholdsTools = [
    {
      name: 'view',
      title: 'View',
      icon: 'fas fa-eye',
      button: true,
      toggle: false,
      visible: true,
      onChange: () => onToolbarViewClick(),
      onClick: () => onToolbarViewClick(),
    },
    isGM
      ? {
          name: 'manage',
          title: 'Manage',
          icon: 'fas fa-cog',
          button: true,
          toggle: false,
          visible: true,
          onChange: () => onToolbarManageClick(),
          onClick: () => onToolbarManageClick(),
        }
      : null,
  ].filter(Boolean) as any[];
  return {
    name: 'strongholds',
    title: 'Strongholds',
    icon: 'fas fa-home',
    layer: 'tokens',
    visible: true,
    tools: strongholdsTools,
  } as any;
}

function buildStrongholdsControlObject() {
  const isGM = (globalThis as any).game?.user?.isGM;
  const tools: Record<string, any> = {
    view: {
      name: 'view',
      title: 'View',
      icon: 'fas fa-eye',
      button: true,
      visible: true,
      onChange: () => onToolbarViewClick(),
      onClick: () => onToolbarViewClick(),
    },
  };
  if (isGM) {
    tools.manage = {
      name: 'manage',
      title: 'Manage',
      icon: 'fas fa-cog',
      button: true,
      visible: true,
      onChange: () => onToolbarManageClick(),
      onClick: () => onToolbarManageClick(),
    };
  }
  // Include a canvas layer to align with how groups are displayed in the toolbar
  return {
    name: 'strongholds',
    title: 'Strongholds',
    icon: 'fas fa-home',
    layer: 'tokens',
    visible: true,
    tools,
  } as any;
}

Hooks.on('getSceneControlButtons', (controls: any) => {
  try {
    const mode = Array.isArray(controls) ? 'array' : 'object';
    const cc = (controls as any)?.controls;
    const ccType = Array.isArray(cc) ? 'array' : typeof cc;
    console.log('[Strongholds] getSceneControlButtons before', {
      mode,
      controlsControlsType: ccType,
    });
  } catch {}
  if (Array.isArray(controls)) {
    const ctl = buildStrongholdsControlArray();
    controls.push(ctl);
  } else if (controls && typeof controls === 'object') {
    // Foundry v13 style
    const ctl = buildStrongholdsControlObject();
    const cc = (controls as any).controls;
    if (Array.isArray(cc)) {
      // Some builds still expose an array of groups
      cc.push(ctl);
    } else if (cc && typeof cc === 'object') {
      // Object map of groups
      cc[ctl.name] = ctl;
    } else {
      (controls as any)[ctl.name] = ctl;
    }
  }
  try {
    const cc = (controls as any)?.controls ?? controls;
    const has = Array.isArray(cc)
      ? cc.some((c: any) => c?.name === 'strongholds')
      : Boolean(cc?.['strongholds']);
    console.log('[Strongholds] getSceneControlButtons after', { registered: has });
  } catch {}
});

// Fallback: if Foundry fails to wire onClick for our tools, delegate via DOM
Hooks.on('renderSceneControls', () => {
  try {
    // Foundry v13 renders scene controls inside #controls
    const toolsRoot = document.querySelector('#controls') as HTMLElement | null;
    if (!toolsRoot) return;
    const flag = '__sh_tools_bound__';
    if ((toolsRoot as any)[flag]) return;
    // Debug: log how many of our tools are present
    const present = toolsRoot.querySelectorAll('[data-tool="view"], [data-tool="manage"]').length;
    console.log(
      '[Strongholds] renderSceneControls: binding fallback on #controls; matching tools present:',
      present,
    );
    toolsRoot.addEventListener(
      'click',
      (ev: Event) => {
        const target = ev.target as Element | null;
        const el = target?.closest?.('[data-tool]') as HTMLElement | null;
        if (!el) return;
        const tool = el.dataset.tool;
        if (tool === 'view') return onToolbarViewClick();
        if (tool === 'manage') return onToolbarManageClick();
      },
      { passive: true },
    );
    (toolsRoot as any)[flag] = true;
  } catch (e) {
    console.error('[Strongholds] renderSceneControls fallback bind failed', e);
  }
});

// Settings menu entries to open Viewer/Manager directly (single, reliable path)
Hooks.once('init', () => {
  try {
    (game as any).settings.registerMenu('strongholds-and-followers', 'openViewer', {
      name: 'Strongholds: View',
      label: 'Open Viewer',
      hint: 'Open the Strongholds viewer window',
      icon: 'fas fa-eye',
      type: class {
        constructor() {
          openStrongholdViewer();
        }
      },
      restricted: false,
    });
    (game as any).settings.registerMenu('strongholds-and-followers', 'openManager', {
      name: 'Strongholds: Manage',
      label: 'Open Manager',
      hint: 'Open the Strongholds management window (GM only)',
      icon: 'fas fa-cog',
      type: class {
        constructor() {
          if ((game as any).user?.isGM) new StrongholdsManagementApp().render(true);
          else (ui as any)?.notifications?.warn?.('GM only');
        }
      },
      restricted: false,
    });
    console.log('[Strongholds] settings menus registered');
  } catch (e) {
    console.error('[Strongholds] failed to register settings menus', e);
  }
});

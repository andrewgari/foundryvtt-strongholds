// Foundry VTT standard FormApplication (ApplicationV2-compatible)
function fvtt() {
  return globalThis as any;
}
const api = fvtt().foundry?.applications?.api;
const AppV2: any = api?.ApplicationV2;
const HBAM: any = api?.HandlebarsApplicationMixin;
import { StrongholdData } from '../lib/StrongholdData';

const Base: any =
  HBAM && AppV2
    ? HBAM(AppV2)
    : (fvtt().Application ??
      class {
        render() {
          return this;
        }
      });


export class StrongholdsManagementApp extends Base {
  // Instance registry for global fallbacks
  static instances: Record<string, StrongholdsManagementApp> = {} as any;
  static DEFAULT_OPTIONS = {
    id: 'strongholds-mgmt',
    window: { title: 'Strongholds Management', icon: 'fas fa-cog' },
    position: { width: 700, height: 'auto' },
    classes: ['strongholds', 'management'],
  };
  constructor(...args: any[]) {
    super(...args);
    try {
      console.log('[Strongholds] StrongholdsManagementApp ctor');
    } catch {}
    try {
      const rid = (this as any)?.id || (this as any)?.options?.id || 'strongholds-mgmt';
      (StrongholdsManagementApp as any).instances[rid] = this as any;
      (this as any).once?.('close', () => {
        try {
          delete (StrongholdsManagementApp as any).instances[rid];
        } catch {}
      });
    } catch {}
  }

  static PARTS = {
    main: { template: 'modules/strongholds-and-followers/templates/strongholds-management.hbs' },
  };

  static get defaultOptions() {
    const opts = super.defaultOptions ?? {};
    const merge = fvtt().foundry?.utils?.mergeObject || fvtt().mergeObject;
    return merge(opts, {
      id: 'strongholds-mgmt',
      title: 'Strongholds Management',
      template: 'modules/strongholds-and-followers/templates/strongholds-management.hbs',
      width: 700,
      classes: ['strongholds', 'management'],
    });
  }

  // Fallback: override render to attach listeners if activateListeners is not firing
  render(force?: boolean, options?: any): any {
    console.log('[Strongholds] render called', { force });

    const result = super.render?.(force, options) ?? this;
    try {
      const rid = (this as any)?.id || (this as any)?.options?.id || 'strongholds-mgmt';
      let tries = 0;
      const tryBind = () => {
        const el =
          ((this as any)?.element as HTMLElement) ||
          (document.getElementById(rid) as HTMLElement) ||
          (document.querySelector(`#${rid}`) as HTMLElement) ||
          (document.querySelector(
            `.strongholds-management[data-app-id="${rid}"]`,
          ) as HTMLElement) ||
          (document.querySelector('.strongholds.management') as HTMLElement);
        if (el instanceof HTMLElement) {
          // Add a single delegated listener if not already added
          const flag = '__sh_mgmt_bound__';
          if (!(el as any)[flag]) {
            console.log('[Strongholds] render() fallback attaching delegated click on root', {
              id: rid,
            });
            el.addEventListener(
              'click',
              (ev: Event) => {
                const t = ev.target as Element | null;
                // Handle context menu trigger (three-dots) even in fallback
                const menuTrig = t?.closest('.menu-trigger') as HTMLElement | null;
                if (menuTrig) {
                  try {
                    const id = menuTrig.dataset.menuId;
                    const esc =
                      (globalThis as any).CSS?.escape ??
                      ((s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'));
                    let menu = (
                      id ? el.querySelector?.(`#${esc(id)}`) : null
                    ) as HTMLElement | null;
                    if (!menu)
                      menu = (
                        id ? document.querySelector?.(`#${esc(id)}`) : null
                      ) as HTMLElement | null;
                    if (!menu) return;
                    const open = !menu.hidden;
                    // Close others
                    el.querySelectorAll?.('.context-menu')?.forEach((m: any) => {
                      m.hidden = true;
                    });
                    el.querySelectorAll?.('.menu-trigger[aria-expanded="true"]')?.forEach(
                      (m: any) => m.setAttribute('aria-expanded', 'false'),
                    );
                    if (!open) {
                      menu.hidden = false;
                      try {
                        menu.removeAttribute('hidden');
                      } catch {}
                      try {
                        (menu.style as any).display = 'block';
                      } catch {}
                      menuTrig.setAttribute('aria-expanded', 'true');
                      const r = menuTrig.getBoundingClientRect();
                      Object.assign(menu.style, {
                        position: 'fixed',
                        top: `${Math.round(r.top + menuTrig.offsetHeight + 4)}px`,
                        left: `${Math.round(r.left)}px`,
                        zIndex: '9999',
                      });
                    }
                  } catch {}
                  return;
                }

                const match = t?.closest('[data-action]') as HTMLElement | null;
                if (!match) return;
                const action = match.dataset.action;
                console.log('[Strongholds] fallback detected click', {
                  action,
                  id: match.dataset.id,
                });
                switch (action) {
                  case 'create':
                    return (this as any)._openCreateDialog?.();
                  case 'edit':
                    return (this as any)._openEditDialog?.(match.dataset.id!);
                  case 'upgrade':
                    return (this as any)._upgradeStronghold?.(match.dataset.id!);
                  case 'delete':
                    return (this as any)._deleteStronghold?.(match.dataset.id!);
                  case 'toggle-active':
                    return (async () => {
                      const id = match.dataset.id!;
                      if (!id) return;
                      const g = fvtt().game;
                      if (!g?.user?.isGM)
                        return fvtt().ui?.notifications?.warn?.(
                          g?.i18n?.localize?.('SAF.OnlyGMCanModify') ??
                            'Only the GM can modify strongholds',
                        );
                      const deepClone =
                        fvtt().foundry?.utils?.deepClone ??
                        ((x: any) => JSON.parse(JSON.stringify(x)));
                      const dict = deepClone(
                        g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {},
                      );
                      if (!dict[id]) return;
                      dict[id].active = !dict[id].active;
                      await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
                      (this as any).render?.();
                    })();
                }
              },
              { passive: true, capture: true } as any,
            );
            (el as any)[flag] = true;
          }
          return true;
        }
        tries++;
        if (tries >= 15) {
          console.warn('[Strongholds] render() fallback could not find root element (giving up)', {
            id: rid,
          });
          // As a last resort, bind a document-level delegated listener scoped to this app id
          const docFlag = `__sh_mgmt_doc_${rid}__` as any;
          if (!(document as any)[docFlag]) {
            console.log('[Strongholds] binding document-level delegated click for mgmt app', {
              id: rid,
            });
            const handler = (ev: Event) => {
              const target = ev.target as Element | null;
              const scopeSel = `.strongholds-management[data-app-id="${rid}"]`;
              const scope = target?.closest?.(scopeSel) as HTMLElement | null;
              // If click is inside a context-menu reparented to body for this app, handle actions regardless of scope
              const inMenu = target?.closest?.(
                `.context-menu[data-app-id="${rid}"]`,
              ) as HTMLElement | null;
              if (inMenu) {
                const btn = (target as Element).closest?.('[data-action]') as HTMLElement | null;
                if (btn) {
                  const action = btn.dataset.action;
                  switch (action) {
                    case 'create':
                      return (this as any)._openCreateDialog?.();
                    case 'edit':
                      return (this as any)._openEditDialog?.(btn.dataset.id!);
                    case 'upgrade':
                      return (this as any)._upgradeStronghold?.(btn.dataset.id!);
                    case 'delete':
                      return (this as any)._deleteStronghold?.(btn.dataset.id!);
                    case 'toggle-active':
                      return (async () => {
                        const id = btn.dataset.id!;
                        if (!id) return;
                        const g = fvtt().game;
                        if (!g?.user?.isGM)
                          return fvtt().ui?.notifications?.warn?.(
                            g?.i18n?.localize?.('SAF.OnlyGMCanModify') ??
                              'Only the GM can modify strongholds',
                          );
                        const deepClone =
                          fvtt().foundry?.utils?.deepClone ??
                          ((x: any) => JSON.parse(JSON.stringify(x)));
                        const dict = deepClone(
                          g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {},
                        );
                        if (!dict[id]) return;
                        dict[id].active = !dict[id].active;
                        await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
                        (this as any).render?.();
                      })();
                  }
                }
                return;
              }
              if (!scope) return; // Ignore clicks outside our app scope

              // Handle menu trigger
              const trig = (target as Element).closest?.('.menu-trigger') as HTMLElement | null;
              if (trig) {
                try {
                  const id = trig.dataset.menuId;
                  const esc =
                    (globalThis as any).CSS?.escape ??
                    ((s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'));
                  const menu = (
                    id ? scope.querySelector?.(`#${esc(id)}`) : null
                  ) as HTMLElement | null;
                  if (!menu) return;
                  console.log('[Strongholds] menu element located', {
                    id,
                    exists: !!menu,
                    childCount: menu?.children?.length,
                  });
                  const isOpen = !menu.hidden;
                  scope.querySelectorAll?.('.context-menu')?.forEach((m: any) => {
                    m.hidden = true;
                  });
                  scope
                    .querySelectorAll?.('.menu-trigger[aria-expanded="true"]')
                    ?.forEach((m: any) => m.setAttribute('aria-expanded', 'false'));
                  if (!isOpen) {
                    menu.hidden = false;
                    try {
                      menu.removeAttribute('hidden');
                    } catch {}
                    try {
                      (menu.style as any).display = 'block';
                    } catch {}
                    trig.setAttribute('aria-expanded', 'true');
                    const r = trig.getBoundingClientRect();
                    Object.assign(menu.style, {
                      position: 'fixed',
                      top: `${Math.round(r.top + trig.offsetHeight + 4)}px`,
                      left: `${Math.round(r.left)}px`,
                      zIndex: '9999',
                    });
                  }
                } catch {}
                return;
              }

              // Handle actions
              const btn = (target as Element).closest?.('[data-action]') as HTMLElement | null;
              if (!btn) return;
              const action = btn.dataset.action;
              switch (action) {
                case 'create':
                  return (this as any)._openCreateDialog?.();
                case 'edit':
                  return (this as any)._openEditDialog?.(btn.dataset.id!);
                case 'upgrade':
                  return (this as any)._upgradeStronghold?.(btn.dataset.id!);
                case 'delete':
                  return (this as any)._deleteStronghold?.(btn.dataset.id!);
                case 'toggle-active':
                  return (async () => {
                    const id = btn.dataset.id!;
                    if (!id) return;
                    const g = fvtt().game;
                    if (!g?.user?.isGM)
                      return fvtt().ui?.notifications?.warn?.(
                        g?.i18n?.localize?.('SAF.OnlyGMCanModify') ??
                          'Only the GM can modify strongholds',
                      );
                    const deepClone =
                      fvtt().foundry?.utils?.deepClone ??
                      ((x: any) => JSON.parse(JSON.stringify(x)));
                    const dict = deepClone(
                      g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {},
                    );
                    if (!dict[id]) return;
                    dict[id].active = !dict[id].active;
                    await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
                    (this as any).render?.();
                  })();
              }
            };
            document.addEventListener('click', handler, { passive: true, capture: true } as any);
            (document as any)[docFlag] = handler;
          }
          return true;
        }
        return false;
      };
      if (!tryBind()) {
        const iv = setInterval(() => {
          if (tryBind()) clearInterval(iv);
        }, 100);
      }
    } catch (e) {
      console.error('[Strongholds] render() fallback error', e);
    }
    return result;
  }

  async _prepareContext(): Promise<any> {
    const g = fvtt().game;
    const dict = g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {};
    const fmt = (n: number) => {
      try {
        return new Intl.NumberFormat().format(Number(n ?? 0));
      } catch {
        return String(n ?? 0);
      }
    };
    const cap = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
    const items = Object.entries(dict).map(([id, s]: [string, any]) => {
      const level = Number(s?.level ?? 1);
      const nextCost =
        level >= 5 ? 0 : StrongholdData.getUpgradeCost(level, Math.min(5, level + 1));
      return {
        id,
        name: s?.name ?? id,
        type: s?.type ?? '-',
        typeDisplay: cap(String(s?.type ?? '-')),
        subtype: s?.classFlavor ?? '',
        subtypeDisplay: s?.classFlavor
          ? ((StrongholdData.CLASS_FLAVOR_DISPLAY as any)[s.classFlavor] ?? s.classFlavor)
          : '',
        level,
        nextUpgradeCost: nextCost,
        nextUpgradeCostDisplay: nextCost ? fmt(nextCost) : '',
        active: !!s?.active,
      };
    });
    return { items, isGM: Boolean(g?.user?.isGM) };
  }

  async getData() {
    const ctx = await (this._prepareContext?.() ?? {});
    const appId = (this as any)?.id || (this as any)?.options?.id || 'strongholds-mgmt';
    return { ...ctx, appId };
  }

  // Use any to avoid dependency on jQuery types; support both jQuery and plain HTMLElement
  activateListeners(html: any): void {
    super.activateListeners?.(html);
    try {
      console.log('[Strongholds] activateListeners called', {
        htmlType: typeof html,
        hasOn: !!(html as any)?.on,
        hasAdd: !!(html as any)?.addEventListener,
        elementPresent: !!(this as any)?.element,
      });
    } catch {}

    // Foundry VTT ApplicationV2 element can be queried from this.element or from the DOM by id
    const defaultId = (this as any)?.id || (this as any)?.options?.id || 'strongholds-mgmt';
    const inferredEl =
      document.querySelector(`.strongholds-management[data-app-id="${defaultId}"]`) ||
      document.getElementById(defaultId) ||
      document.querySelector(`#${defaultId}`);
    const rootEl: HTMLElement | null =
      html instanceof HTMLElement
        ? html
        : (this as any)?.element instanceof HTMLElement
          ? (this as any).element
          : (inferredEl as HTMLElement | null);
    console.log('[Strongholds] inferred rootEl', { defaultId, rootElFound: !!rootEl });

    const bindClick = (selector: string, handler: (ev: any) => void) => {
      try {
        if (html && typeof (html as any).on === 'function') {
          console.log('[Strongholds] bindClick(jQuery) for', selector);
          (html as any).on('click', selector, handler);
          return;
        }
        if (rootEl && typeof rootEl.addEventListener === 'function') {
          console.log('[Strongholds] bindClick(native) for', selector, { rootEl });
          rootEl.addEventListener(
            'click',
            (ev: Event) => {
              const target = (ev.target as Element) || null;
              const match = target ? (target.closest(selector) as HTMLElement | null) : null;
              if (match && rootEl.contains(match)) {
                console.log('[Strongholds] click detected for', selector, { match });
                (handler as any)({ ...ev, currentTarget: match });
              }
            },
            true,
          );
          return;
        }
        console.warn('[Strongholds] bindClick could not attach for', selector, { html, rootEl });
      } catch (e) {
        console.error('[Strongholds] bindClick error', e);
      }
    };

    // Header viewer/reload controls removed to reduce clutter

    bindClick('[data-action="toggle-active"]', async (ev: any) => {
      const id = (ev.currentTarget as HTMLElement)?.dataset?.id;
      console.log('[Strongholds] toggle-active clicked', { id });
      if (!id) return;
      const g = fvtt().game;
      if (!g?.user?.isGM) {
        return fvtt().ui?.notifications?.warn?.(
          g?.i18n?.localize?.('SAF.OnlyGMCanModify') ?? 'Only the GM can modify strongholds',
        );
      }
      const deepClone =
        fvtt().foundry?.utils?.deepClone ??
        fvtt().foundry?.utils?.duplicate ??
        ((x: any) =>
          typeof structuredClone === 'function'
            ? structuredClone(x)
            : JSON.parse(JSON.stringify(x)));
      const dict = deepClone(g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {});
      if (!dict[id]) return;
      dict[id].active = !dict[id].active;
      try {
        await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
        this.render?.();
      } catch (err) {
        fvtt().ui?.notifications?.error?.(
          g?.i18n?.localize?.('SAF.UpdateFailed') ?? 'Failed to update stronghold state',
        );
        console.error(err);
      }
    });

    bindClick('[data-action="create"]', () => {
      console.log('[Strongholds] create clicked');
      this._openCreateDialog();
    });

    bindClick('[data-action="edit"]', (ev: any) => {
      const id = (ev.currentTarget as HTMLElement)?.dataset?.id;
      console.log('[Strongholds] edit clicked', { id });
      if (id) this._openEditDialog(id);
    });

    bindClick('[data-action="upgrade"]', (ev: any) => {
      const id = (ev.currentTarget as HTMLElement)?.dataset?.id;
      console.log('[Strongholds] upgrade clicked', { id });
      if (id) this._upgradeStronghold(id);
    });

    bindClick('[data-action="delete"]', (ev: any) => {
      const id = (ev.currentTarget as HTMLElement)?.dataset?.id;
      console.log('[Strongholds] delete clicked', { id });
      if (id) this._deleteStronghold(id);
    });

    // Context menu (three dots) behavior
    const closeAllMenus = () => {
      try {
        rootEl?.querySelectorAll?.('.context-menu').forEach((m) => {
          (m as HTMLElement).hidden = true;
        });
        rootEl?.querySelectorAll?.('.menu-trigger[aria-expanded="true"]').forEach((t) => {
          (t as HTMLElement).setAttribute('aria-expanded', 'false');
        });
      } catch {}
    };

    bindClick('.menu-trigger, .row-menu', (ev: any) => {
      const ct = (ev.currentTarget as HTMLElement) || null;
      const trigger = ct?.classList?.contains('menu-trigger')
        ? ct
        : (ct?.querySelector?.('.menu-trigger') as HTMLElement | null);
      if (!trigger) return;
      console.log('[Strongholds] menu-trigger clicked', { trigger });
      const id = trigger.dataset.menuId;
      const esc =
        (globalThis as any).CSS?.escape ?? ((s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'));
      let menu = (id ? rootEl?.querySelector?.(`#${esc(id)}`) : null) as HTMLElement | null;
      if (!menu) menu = (id ? document.querySelector?.(`#${esc(id)}`) : null) as HTMLElement | null;
      if (!menu) return;
      const isOpen = !menu.hidden;
      closeAllMenus();
      if (isOpen) return; // was open, now closed
      menu.hidden = false;
      try {
        menu.removeAttribute('hidden');
      } catch {}
      try {
        (menu.style as any).display = 'block';
      } catch {}
      try {
        (menu.style as any).zIndex = '2147483647';
      } catch {}
      // Fallback inline styles to ensure visibility even if CSS not loaded
      try {
        Object.assign(menu.style, {
          minWidth: menu.style.minWidth || '160px',
          background: menu.style.background || 'var(--color-bg-option, #2e2e2e)',
          color: menu.style.color || 'var(--color-text-dark-primary, #fff)',
          border: menu.style.border || '1px solid rgba(255,255,255,.15)',
          borderRadius: menu.style.borderRadius || '6px',
          padding: menu.style.padding || '4px',
          boxShadow: menu.style.boxShadow || '0 6px 20px rgba(0,0,0,.35)',
        } as Partial<CSSStyleDeclaration>);
      } catch {}
      try {
        if (menu.parentElement !== document.body) document.body.appendChild(menu);
      } catch {}
      trigger.setAttribute('aria-expanded', 'true');

      // Position menu relative to trigger
      try {
        const rect = trigger.getBoundingClientRect();
        if (rect) {
          let top = rect.top + trigger.offsetHeight + 4;
          let left = rect.left;
          // Clamp to viewport
          try {
            const mw = Math.max(menu.offsetWidth || 160, 160);
            const mh = Math.max(menu.offsetHeight || 10, 10);
            const vw = window.innerWidth || 1920;
            const vh = window.innerHeight || 1080;
            if (left + mw > vw - 8) left = vw - mw - 8;
            if (left < 4) left = 4;
            if (top + mh > vh - 8) top = Math.max(4, rect.top - mh - 4);
            if (top < 4) top = 4;
          } catch {}
          Object.assign(menu.style, {
            position: 'fixed',
            top: `${Math.round(top)}px`,
            left: `${Math.round(left)}px`,
          });
          console.log('[Strongholds] menu open -> coords', {
            rect,
            top,
            left,
            hidden: menu.hidden,
            disp: (menu.style as any).display,
            z: (menu.style as any).zIndex,
          });
        }
      } catch {}
      // Focus first action for visibility/accessibility
      try {
        (menu.querySelector('button') as HTMLButtonElement | null)?.focus?.();
      } catch {}
      // Guard: mark last-open time to avoid immediate close by outside-click
      try {
        (globalThis as any).__sh_menu_last_open__ = performance.now?.() ?? Date.now();
      } catch {}
    });

    // Close menus on outside click and on Escape
    const onDocClick = (e: Event) => {
      // Ignore clicks that happen immediately after opening (capture bubbling conflicts)
      try {
        const now = performance.now?.() ?? Date.now();
        const last = (globalThis as any).__sh_menu_last_open__ as number | undefined;
        if (last && now - last < 250) return;
      } catch {}
      const t = e.target as Node;
      if (!rootEl) return;
      const inside = rootEl.contains(t);
      if (!inside) return; // ignore clicks outside the app entirely
      const hitTrigger = (t as Element)?.closest?.('.menu-trigger, .row-menu, .context-menu');
      if (hitTrigger) return;
      closeAllMenus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAllMenus();
    };
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey);
    // Attempt minimal cleanup on close
    try {
      (this as any).once?.('close', () => {
        document.removeEventListener('click', onDocClick, true);
        document.removeEventListener('keydown', onKey);
      });
    } catch {}

    // Always: delegate actions from reparented context menu under document.body for this app id
    try {
      const rid = (this as any)?.id || (this as any)?.options?.id || 'strongholds-mgmt';
      const actFlag = `__sh_mgmt_doc_actions_${rid}__` as any;
      if (!(document as any)[actFlag]) {
        const onAction = (ev: Event) => {
          const t = ev.target as Element | null;
          const menu = t?.closest?.(`.context-menu[data-app-id="${rid}"]`) as HTMLElement | null;
          if (!menu) return;
          const btn = t?.closest?.('[data-action]') as HTMLElement | null;
          if (!btn) return;
          const action = btn.dataset.action;
          const id = btn.dataset.id!;
          console.log('[Strongholds] (doc) action click', { action, id });
          switch (action) {
            case 'create':
              return (this as any)._openCreateDialog?.();
            case 'edit':
              return id ? (this as any)._openEditDialog?.(id) : undefined;
            case 'upgrade':
              return id ? (this as any)._upgradeStronghold?.(id) : undefined;
            case 'delete':
              return id ? (this as any)._deleteStronghold?.(id) : undefined;
            case 'toggle-active':
              return (async () => {
                if (!id) return;
                const g = fvtt().game;
                if (!g?.user?.isGM)
                  return fvtt().ui?.notifications?.warn?.(
                    g?.i18n?.localize?.('SAF.OnlyGMCanModify') ??
                      'Only the GM can modify strongholds',
                  );
                const deepClone =
                  fvtt().foundry?.utils?.deepClone ?? ((x: any) => JSON.parse(JSON.stringify(x)));
                const dict = deepClone(
                  g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {},
                );
                if (!dict[id]) return;
                dict[id].active = !dict[id].active;
                await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
                (this as any).render?.();
              })();
          }
        };
        document.addEventListener('click', onAction, true);
        (document as any)[actFlag] = onAction;
        // Cleanup on close
        try {
          (this as any).once?.('close', () => {
            const h = (document as any)[actFlag];
            if (h) document.removeEventListener('click', h, true);
            (document as any)[actFlag] = null;
          });
        } catch {}
      }
    } catch {}

    // Extra safety: also bind a document-level delegated handler for menu-trigger in case the above fails
    try {
      const rid = (this as any)?.id || (this as any)?.options?.id || 'strongholds-mgmt';
      const docFlag = `__sh_mgmt_doc_menu_${rid}__` as any;
      if (!(document as any)[docFlag]) {
        const handler = (e: Event) => {
          const t = e.target as Element | null;
          const container = t?.closest?.('.menu-trigger, .row-menu') as HTMLElement | null;
          if (!container) return;
          const trigger = container.classList.contains('menu-trigger')
            ? container
            : (container.querySelector?.('.menu-trigger') as HTMLElement | null);
          if (!trigger) return;
          console.log('[Strongholds] (doc) menu-trigger clicked');
          const id = trigger.dataset.menuId;
          const esc =
            (globalThis as any).CSS?.escape ??
            ((s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'));
          const menu = (id ? document.querySelector?.(`#${esc(id)}`) : null) as HTMLElement | null;
          if (!menu) return;
          // Close any other menus globally
          document.querySelectorAll?.('.context-menu')?.forEach((m: any) => {
            (m as HTMLElement).hidden = true;
            (m as HTMLElement).style.display = 'none';
          });
          document
            .querySelectorAll?.('.menu-trigger[aria-expanded="true"]')
            ?.forEach((m: any) => (m as HTMLElement).setAttribute('aria-expanded', 'false'));
          // Open this one
          menu.hidden = false;
          try {
            menu.removeAttribute('hidden');
          } catch {}
          try {
            (menu.style as any).display = 'block';
          } catch {}
          try {
            (menu.style as any).zIndex = '9999';
          } catch {}
          trigger.setAttribute('aria-expanded', 'true');
          const r = trigger.getBoundingClientRect();
          Object.assign(menu.style, {
            position: 'fixed',
            top: `${Math.round(r.top + trigger.offsetHeight + 4)}px`,
            left: `${Math.round(r.left)}px`,
          });
        };
        document.addEventListener('click', handler, { passive: true, capture: true } as any);
        (document as any)[docFlag] = handler;
      }
    } catch {}
  }

  private _renderFormContent(init?: Partial<any>): string {
    const name = init?.name ?? '';
    const type = init?.type ?? StrongholdData.STRONGHOLD_TYPES[0];
    const flavor = init?.classFlavor ?? '';
    const level = Number(init?.level ?? 1);
    const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    return `
      <div class="strongholds-dialog">
        <form class="stronghold-form">
          <div class="form-group">
            <label>Name</label>
            <input class="sh-input" type="text" name="name" value="${name}" required />
          </div>
          <div class="form-group">
            <label>Type</label>
            <select class="sh-select" name="type">
              ${StrongholdData.STRONGHOLD_TYPES.map((t) => `<option value="${t}" ${t === type ? 'selected' : ''}>${cap(t)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Subtype</label>
            <select class="sh-select" name="classFlavor">
              <option value="" ${!flavor ? 'selected' : ''}>— None —</option>
              ${Object.entries(StrongholdData.CLASS_FLAVOR_DISPLAY)
                .map(
                  ([k, v]) =>
                    `<option value="${k}" ${k === flavor ? 'selected' : ''}>${v}</option>`,
                )
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Level</label>
            <input class="sh-input" type="number" name="level" min="1" max="5" step="1" value="${level}" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="sh-textarea" name="description" rows="3">${init?.description ?? ''}</textarea>
          </div>
        </form>
      </div>
    `;
  }

  private async _openCreateDialog() {
    const g = fvtt().game;
    if (!g?.user?.isGM)
      return fvtt().ui?.notifications?.warn?.(
        g?.i18n?.localize?.('SAF.OnlyGMCanModify') ?? 'Only the GM can modify strongholds',
      );

    const DialogCls = fvtt().Dialog;
    const content = this._renderFormContent();

    const submit = async (htmlEl?: HTMLElement) => {
      try {
        const form =
          (htmlEl?.querySelector?.('form') as HTMLFormElement) ??
          document.querySelector('form.stronghold-form');
        const fd = new FormData(form);
        const name = String(fd.get('name') ?? '').trim();
        const type = String(fd.get('type') ?? 'keep') as any;
        const classFlavor = String(fd.get('classFlavor') ?? '') || (null as any);
        const level = Number(fd.get('level') ?? 1);
        const description = String(fd.get('description') ?? '');
        if (!name) throw new Error('Name is required');

        // Read + write settings
        const deepClone =
          fvtt().foundry?.utils?.deepClone ?? ((x: any) => JSON.parse(JSON.stringify(x)));
        const dict = deepClone(g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {});
        const s = StrongholdData.createStronghold(name, type, classFlavor, level, description);
        dict[s.id] = s;
        await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
        this.render?.();
      } catch (e) {
        fvtt().ui?.notifications?.error?.((e as Error)?.message ?? 'Failed to create stronghold');
      }
    };

    if (DialogCls) {
      const dlg = new DialogCls({
        title: 'Create Stronghold',
        content,
        buttons: {
          ok: { label: 'Create', callback: (html: any) => submit(html?.[0] ?? html) },
          cancel: { label: 'Cancel' },
        },
        default: 'ok',
      });
      try {
        (dlg as any).options = (dlg as any).options || {};
        (dlg as any).options.classes = [
          ...((dlg as any).options.classes ?? []),
          'strongholds-dark',
        ];
      } catch {}
      dlg.render(true);
      try {
        setTimeout(() => {
          const el = (dlg as any).element?.[0] as HTMLElement | undefined;
          el?.classList?.add('strongholds-dark');
        }, 0);
      } catch {}
    } else {
      // Fallback minimal prompts
      const name = prompt('Stronghold name?') ?? '';
      if (!name) return;
      const s = StrongholdData.createStronghold(name, 'keep', null, 1, '');
      const dict = g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {};
      dict[s.id] = s;
      await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
      this.render?.();
    }
  }

  private async _openEditDialog(id: string) {
    const g = fvtt().game;
    if (!g?.user?.isGM)
      return fvtt().ui?.notifications?.warn?.(
        g?.i18n?.localize?.('SAF.OnlyGMCanModify') ?? 'Only the GM can modify strongholds',
      );
    const current = g?.settings?.get('strongholds-and-followers', 'strongholds')?.[id];
    if (!current) return;

    const DialogCls = fvtt().Dialog;
    const content = this._renderFormContent(current);

    const submit = async (htmlEl?: HTMLElement) => {
      try {
        const form =
          (htmlEl?.querySelector?.('form') as HTMLFormElement) ??
          document.querySelector('form.stronghold-form');
        const fd = new FormData(form);
        const name = String(fd.get('name') ?? '').trim();
        const type = String(fd.get('type') ?? 'keep') as any;
        const classFlavor = String(fd.get('classFlavor') ?? '') || (null as any);
        const level = Number(fd.get('level') ?? 1);
        const description = String(fd.get('description') ?? '');
        if (!name) throw new Error('Name is required');

        const deepClone =
          fvtt().foundry?.utils?.deepClone ?? ((x: any) => JSON.parse(JSON.stringify(x)));
        const dict = deepClone(g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {});
        if (!dict[id]) throw new Error('Stronghold not found');
        dict[id] = {
          ...dict[id],
          name,
          type,
          classFlavor,
          level: Math.max(1, Math.min(5, Math.floor(level))),
          description,
        };
        await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
        this.render?.();
      } catch (e) {
        fvtt().ui?.notifications?.error?.((e as Error)?.message ?? 'Failed to update stronghold');
      }
    };

    if (DialogCls) {
      const dlg = new DialogCls({
        title: 'Edit Stronghold',
        content,
        buttons: {
          ok: { label: 'Save', callback: (html: any) => submit(html?.[0] ?? html) },
          cancel: { label: 'Cancel' },
        },
        default: 'ok',
      });
      try {
        (dlg as any).options = (dlg as any).options || {};
        (dlg as any).options.classes = [
          ...((dlg as any).options.classes ?? []),
          'strongholds-dark',
        ];
      } catch {}
      dlg.render(true);
      try {
        setTimeout(() => {
          const el = (dlg as any).element?.[0] as HTMLElement | undefined;
          el?.classList?.add('strongholds-dark');
        }, 0);
      } catch {}
    } else {
      const name = prompt('New name?', String(current?.name ?? '')) ?? '';
      if (!name) return;
      const deepClone =
        fvtt().foundry?.utils?.deepClone ?? ((x: any) => JSON.parse(JSON.stringify(x)));
      const dict = deepClone(g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {});
      dict[id] = { ...dict[id], name };
      await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
      this.render?.();
    }
  }

  private async _upgradeStronghold(id: string) {
    const g = fvtt().game;
    if (!g?.user?.isGM)
      return fvtt().ui?.notifications?.warn?.(
        g?.i18n?.localize?.('SAF.OnlyGMCanModify') ?? 'Only the GM can modify strongholds',
      );
    const deepClone =
      fvtt().foundry?.utils?.deepClone ?? ((x: any) => JSON.parse(JSON.stringify(x)));
    const dict = deepClone(g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {});
    const s = dict[id];
    if (!s) return;
    const current = Number(s.level ?? 1);
    if (current >= 5) return fvtt().ui?.notifications?.info?.('Already at max level');
    const cost = StrongholdData.getUpgradeCost(current, current + 1);
    s.level = current + 1;
    s.totalCostPaid = Number(s.totalCostPaid ?? StrongholdData.getBuildingCost(s.type)) + cost;
    try {
      await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
      fvtt().ui?.notifications?.info?.(`Upgraded to level ${s.level} (cost ${cost})`);
      this.render?.();
    } catch (e) {
      fvtt().ui?.notifications?.error?.('Failed to upgrade stronghold');
    }
  }

  private async _deleteStronghold(id: string) {
    const g = fvtt().game;
    if (!g?.user?.isGM)
      return fvtt().ui?.notifications?.warn?.(
        g?.i18n?.localize?.('SAF.OnlyGMCanModify') ?? 'Only the GM can modify strongholds',
      );
    const confirmed =
      (await fvtt().Dialog?.confirm?.({
        title: 'Delete Stronghold',
        content: '<p>Are you sure you want to delete this stronghold?</p>',
      })) ?? confirm('Delete this stronghold?');
    if (!confirmed) return;
    const deepClone =
      fvtt().foundry?.utils?.deepClone ?? ((x: any) => JSON.parse(JSON.stringify(x)));
    const dict = deepClone(g?.settings?.get('strongholds-and-followers', 'strongholds') ?? {});
    if (!dict[id]) return;
    try {
      delete dict[id];
      await g?.settings?.set('strongholds-and-followers', 'strongholds', dict);
      this.render?.();
    } catch (e) {
      fvtt().ui?.notifications?.error?.('Failed to delete stronghold');
    }
  }
}

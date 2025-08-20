/*
  Strongholds Menu Application
  Usage (e.g., macro or console):
    // Provide your strongholds array in the expected shape
    const data = {
      strongholds: [ /* ... */ ],
      showActions: true,
      showExpandControls: true
    };
    new StrongholdsMenu(data).render(true);
*/

class StrongholdsMenu extends Application {
  static MODULE_ID = 'foundryvtt-strongholds'; // Set this to your module id
  static templatePath() {
    return this.MODULE_ID ? `modules/${this.MODULE_ID}/templates/strongholds-menu.hbs` : 'templates/strongholds-menu.hbs';
  }
  constructor(data = {}) {
    super();
    StrongholdsMenu.ensureStylesInjected();
    this.state = { expanded: new Set() };
    this.dataModel = {
      strongholds: Array.isArray(data.strongholds) ? data.strongholds : [],
      showActions: Boolean(data.showActions)
      showExpandControls: Boolean(data.showExpandControls)
    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'strongholds-menu',
      classes: ['strongholds-menu-app'],
      title: 'Strongholds',
      template: StrongholdsMenu.templatePath(),
      width: 640,
      height: 'auto',
      resizable: true
    });
  }

  setData(data = {}) {
    if (Array.isArray(data.strongholds)) this.dataModel.strongholds = data.strongholds;
    if (typeof data.showActions !== 'undefined') this.dataModel.showActions = Boolean(data.showActions);
    if (typeof data.showExpandControls !== 'undefined') this.dataModel.showExpandControls = Boolean(data.showExpandControls);
    this.render(false);
  }

  getData() {
    const shs = [...this.dataModel.strongholds];
    shs.sort((a, b) => (b.level || 0) - (a.level || 0) || String(a.name || '').localeCompare(String(b.name || '')));
    // Mark expanded items based on state
    for (const sh of shs) sh.expanded = this.state.expanded.has(String(sh.id));
    return {
      strongholds: shs,
      showActions: this.dataModel.showActions,
      showExpandControls: this.dataModel.showExpandControls
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Initialize expanded rows based on aria-expanded
    html.find('.sm-row').each((_, li) => {
      const $li = $(li);
      const btn = $li.find('.sm-toggle')[0];
      if (!btn) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const details = $li.find('.sm-details')[0];
      if (expanded) {
        $li.addClass('is-expanded');
        details?.removeAttribute('hidden');
      }
    });

    // Toggle details per row
    html.on('click', '.sm-toggle', (ev) => {
      ev.preventDefault();
      const btn = ev.currentTarget;
      const li = btn.closest('.sm-row');
      const details = li?.querySelector('.sm-details');
      const id = li?.getAttribute('data-id');
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      if (!details || !id) return;

      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        details.setAttribute('hidden', '');
        li.classList.remove('is-expanded');
        this.state.expanded.delete(String(id));
      } else {
        btn.setAttribute('aria-expanded', 'true');
        details.removeAttribute('hidden');
        li.classList.add('is-expanded');
        this.state.expanded.add(String(id));
      }
    });

    // Expand all / Collapse all
    html.on('click', '.sm-expand-all', (ev) => {
      ev.preventDefault();
      html.find('.sm-row').each((_, li) => {
        const $li = $(li);
        const id = $li.attr('data-id');
        const btn = $li.find('.sm-toggle')[0];
        const details = $li.find('.sm-details')[0];
        if (btn && details && id) {
          btn.setAttribute('aria-expanded', 'true');
          details.removeAttribute('hidden');
          $li.addClass('is-expanded');
          this.state.expanded.add(String(id));
        }
      });
    });

    html.on('click', '.sm-collapse-all', (ev) => {
      ev.preventDefault();
      html.find('.sm-row').each((_, li) => {
        const $li = $(li);
        const id = $li.attr('data-id');
        const btn = $li.find('.sm-toggle')[0];
        const details = $li.find('.sm-details')[0];
        if (btn && details && id) {
          btn.setAttribute('aria-expanded', 'false');
          details.setAttribute('hidden', '');
          $li.removeClass('is-expanded');
          this.state.expanded.delete(String(id));
        }
      });
    });
  }
  static ensureStylesInjected() {
    const styleId = 'strongholds-menu-inline-style';
    if (document.getElementById(styleId)) return;
    const css = `
.strongholds-menu { padding: 6px 8px; }
.sm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.sm-title { font-size: 1.1rem; margin: 0; font-weight: 700; }
.sm-list-controls .btn { margin-left: 6px; }
.sm-list { list-style: none; margin: 0; padding: 0; }
.sm-row { border-top: 1px solid var(--color-border-light, #c9c9c9); }
.sm-row:first-child { border-top: 0; }
.sm-row-inner { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; padding: 6px 2px; }
.sm-toggle { background: transparent; border: 0; color: inherit; padding: 0 4px; cursor: pointer; display: inline-flex; align-items: center; }
.sm-caret { transition: transform 0.15s ease; }
.is-expanded .sm-caret { transform: rotate(90deg); }
.sm-main { display: flex; align-items: baseline; gap: 10px; min-width: 0; }
.sm-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
.sm-badges { display: inline-flex; gap: 6px; flex-wrap: wrap; }
.sm-badge { font-size: 0.85rem; line-height: 1; padding: 3px 6px; border-radius: 4px; background: var(--badge-bg, #eef1f5); color: var(--badge-fg, #223); border: 1px solid var(--badge-border, #cdd5df); }
.sm-badge-type { background: #eef6ff; border-color: #cfe3ff; color: #1a3f6b; }
.sm-badge-level { background: #f4fff0; border-color: #d9f8c8; color: #2a5d1a; }
.sm-badge-status { background: #fff7e6; border-color: #ffe1b0; color: #6b4a1a; }
.sm-actions .btn { margin-left: 6px; }
.sm-details { padding: 4px 28px 8px 28px; }
.sm-bonuses { display: grid; grid-template-columns: 1fr; gap: 6px; }
.sm-bonus-group { border-left: 3px solid #dbe6f5; padding-left: 8px; }
.sm-group-title { font-size: 0.95rem; margin: 4px 0 2px; display: flex; align-items: center; gap: 6px; }
.sm-group-icon { color: #607d8b; }
.sm-group-list { list-style: none; margin: 0; padding: 0; }
.sm-bonus-item { display: grid; grid-template-columns: auto 1fr auto auto; gap: 6px; padding: 2px 0; align-items: center; border-bottom: 1px dotted #e7edf4; }
.sm-bonus-item:last-child { border-bottom: 0; }
.sm-bonus-icon { color: #607d8b; }
.sm-bonus-label { color: #222; }
.sm-bonus-value { font-weight: 600; color: #1f5e29; }
.sm-bonus-source { color: #5a6b7b; font-size: 0.85em; }
.sm-empty { padding: 8px; color: #666; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }
@media (max-width: 520px) { .sm-row-inner { grid-template-columns: auto 1fr; } .sm-actions { grid-column: 1 / -1; } .sm-name { max-width: 100%; } }
`;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

// Expose globally for easy use via macro or console
window.StrongholdsMenu = StrongholdsMenu;


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
  constructor(data = {}) {
    super();
    this.state = { expanded: new Set() };
    this.dataModel = {
      strongholds: Array.isArray(data.strongholds) ? data.strongholds : [],
      showActions: Boolean(data.showActions),
      showExpandControls: Boolean(data.showExpandControls)
    };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'strongholds-menu',
      classes: ['strongholds-menu-app'],
      title: 'Strongholds',
      template: 'templates/strongholds-menu.hbs',
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
}

// Expose globally for easy use via macro or console
window.StrongholdsMenu = StrongholdsMenu;


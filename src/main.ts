import './styles/main.scss';
import StrongholdsApp from './apps/StrongholdsApp.svelte';
import StrongholdsManagementApp from './apps/StrongholdsManagementApp.svelte';
import { SvelteApplication, type SvelteAppOptions } from './foundry/ApplicationBase';

class StrongholdsSvelteApp extends SvelteApplication {}
class StrongholdsManagementSvelteApp extends SvelteApplication {}

Hooks.once('init', () => {
  console.log('Strongholds | init');
});

Hooks.once('ready', () => {
  console.log('Strongholds | ready');
});

Hooks.on('getSceneControlButtons', (controls: unknown[]) => {
  const isGM = game.user?.isGM;

  const strongholdsTools = [
    {
      name: 'view-strongholds',
      title: 'View Strongholds',
      icon: 'fas fa-eye',
      onClick: () => new StrongholdsSvelteApp({ id: 'strongholds-app', title: 'Strongholds', svelte: StrongholdsApp } as SvelteAppOptions).render(true),
      button: true
    },
    isGM
      ? {
          name: 'edit-strongholds',
          title: 'Manage Strongholds',
          icon: 'fas fa-edit',
          onClick: () => new StrongholdsManagementSvelteApp({ id: 'strongholds-mgmt', title: 'Strongholds Management', svelte: StrongholdsManagementApp } as SvelteAppOptions).render(true),
          button: true
        }
      : null
  ].filter(Boolean);

  (controls as any).push({
    name: 'strongholds',
    title: 'Strongholds',
    icon: 'fas fa-home',
    layer: 'controls',
    tools: strongholdsTools,
    activeTool: null
  });
});

if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', () => {
    console.log('Vite update applied');
  });
}


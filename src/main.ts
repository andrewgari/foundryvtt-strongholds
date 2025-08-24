import './styles/main.scss';
import StrongholdsManagementApp from './apps/StrongholdsManagementApp.svelte';
import { SvelteApplication, type SvelteAppOptions } from './foundry/ApplicationBase';
import { openStrongholdViewer } from './apps/StrongholdViewerApp';

class StrongholdsManagementSvelteApp extends SvelteApplication {}



Hooks.once('init', () => {
  console.log('Strongholds | init');
});

Hooks.once('ready', () => {
  console.log('Strongholds | ready');
});

Hooks.on('getSceneControlButtons', (controls: unknown[]) => {
  console.log('Strongholds | getSceneControlButtons hook called');
  const isGM = game.user?.isGM;
  console.log('Strongholds | User is GM:', isGM);

  const handleView = (event?: unknown) => {
    console.log('Strongholds | View tool invoked', event);
    // Guard: only respond to real button clicks on our 'view' tool
    if (!(event instanceof MouseEvent)) return;
    const target = event.currentTarget as HTMLElement | null;
    const toolName = target?.dataset?.tool;
    if (toolName !== 'view') return;
    try {
      const app = openStrongholdViewer();
      console.log('Strongholds | Viewer app created:', app);
      return app;
    } catch (error) {
      console.error('Strongholds | Error opening viewer:', error);
      (globalThis as any).ui?.notifications?.error?.('Failed to open Stronghold Viewer');
    }
  };

  const handleManage = (event?: unknown) => {
    console.log('Strongholds | Manage tool invoked', event);
    // Guard: only respond to real button clicks on our 'manage' tool
    if (!(event instanceof MouseEvent)) return;
    const target = event.currentTarget as HTMLElement | null;
    const toolName = target?.dataset?.tool;
    if (toolName !== 'manage') return;
    try {
      const app = new StrongholdsManagementSvelteApp({
        id: 'strongholds-mgmt',
        title: 'Strongholds Management',
        svelte: StrongholdsManagementApp
      } as SvelteAppOptions).render(true);
      console.log('Strongholds | Management app created:', app);
      return app;
    } catch (error) {
      console.error('Strongholds | Error opening management:', error);
      (globalThis as any).ui?.notifications?.error?.('Failed to open Strongholds Management');
    }
  };

  const strongholdsTools = [
    {
      name: 'view',
      title: 'View',
      icon: 'fas fa-eye',
      button: true,
      visible: true,
      toggle: false,
      onClick: handleView
    },
    isGM
      ? {
          name: 'manage',
          title: 'Manage',
          icon: 'fas fa-cog',
          button: true,
          visible: true,
          toggle: false,
          onClick: handleManage
        }
      : null
  ].filter(Boolean);

  const strongholdsControl = {
    name: 'strongholds',
    title: 'Strongholds',
    icon: 'fas fa-home',
    layer: 'tokens',
    tools: strongholdsTools
  };

  console.log('Strongholds | Adding control with tools:', strongholdsTools);
  (controls as any).push(strongholdsControl);
});



if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', () => {
    console.log('Vite update applied');
  });
}

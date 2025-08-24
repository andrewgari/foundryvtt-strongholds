import './styles/main.scss';
import { StrongholdsManagementApp } from './apps/StrongholdsManagementApp';
import { openStrongholdViewer } from './apps/StrongholdViewerApp';



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

  const handleViewClick = (event?: unknown) => {
    console.log('Strongholds | View tool click', event);
    if (!(event instanceof MouseEvent)) return;
    const target = event.currentTarget as HTMLElement | null;
    if (target?.dataset?.tool !== 'view') return;
    try {
      const app = openStrongholdViewer();
      console.log('Strongholds | Viewer app created:', app);
      return app;
    } catch (error) {
      console.error('Strongholds | Error opening viewer:', error);
      (globalThis as any).ui?.notifications?.error?.('Failed to open Stronghold Viewer');
    }
  };

  const handleManageClick = (event?: unknown) => {
    console.log('Strongholds | Manage tool click', event);
    if (!(event instanceof MouseEvent)) return;
    const target = event.currentTarget as HTMLElement | null;
    if (target?.dataset?.tool !== 'manage') return;
    try {
      const app = new StrongholdsManagementApp();
      app.render(true);
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
      onClick: handleViewClick
    },
    isGM
      ? {
          name: 'manage',
          title: 'Manage',
          icon: 'fas fa-cog',
          button: true,
          visible: true,
          toggle: false,
          onClick: handleManageClick
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

import './styles/main.scss';
import { StrongholdsManagementApp } from './apps/StrongholdsManagementApp';
import { openStrongholdViewer } from './apps/StrongholdViewerApp';



// Register module settings so apps can read/write strongholds data
Hooks.once('init', () => {
  const g: any = (globalThis as any).game;
  try {
    const settings = g?.settings;
    if (settings) {
      if (!settings.settings.has('strongholds-and-followers.strongholds')) {
      
        settings.register('strongholds-and-followers', 'strongholds', {
          scope: 'world',
          config: false,
          type: Object,
          default: {}
        });
      }
    }
  } catch {}

});



Hooks.once('ready', () => {
  try {
    if (!(globalThis as any).__strongholdsDomBound) {
      (globalThis as any).__strongholdsDomBound = true;
      const captureHandler = (ev: Event) => {
        const tool = (ev.target as HTMLElement | null)?.closest?.('[data-tool]')?.getAttribute('data-tool');
        if (tool === 'view') openStrongholdViewer();
        else if (tool === 'manage') new StrongholdsManagementApp().render(true);
      };
      document.addEventListener('pointerdown', captureHandler, true);
      document.addEventListener('click', captureHandler, true);
    } else {
      // already bound
    }
  } catch {}

});

function buildStrongholdsControl() {
  const isGM = (globalThis as any).game?.user?.isGM;
  const handleViewClick = () => openStrongholdViewer();
  const handleViewChange = () => handleViewClick();
  const handleManageClick = () => new StrongholdsManagementApp().render(true);
  const handleManageChange = () => handleManageClick();
  const strongholdsTools = [
    { name: 'view', title: 'View', icon: 'fas fa-eye', button: true, visible: true, toggle: false, onClick: handleViewClick, onChange: handleViewChange },
    isGM ? { name: 'manage', title: 'Manage', icon: 'fas fa-cog', button: true, visible: true, toggle: false, onClick: handleManageClick, onChange: handleManageChange } : null
  ].filter(Boolean);
  return { name: 'strongholds', title: 'Strongholds', icon: 'fas fa-home', tools: strongholdsTools };
}

Hooks.on('getSceneControlButtons', (controls: any) => {
  const ctl = buildStrongholdsControl();
  if (Array.isArray(controls)) {
    controls.push(ctl);
  } else if (controls?.controls && Array.isArray(controls.controls)) {
    controls.controls.push(ctl);
  } else if (controls && typeof controls === 'object') {
    (controls as any)[ctl.name] = ctl;
  }

});

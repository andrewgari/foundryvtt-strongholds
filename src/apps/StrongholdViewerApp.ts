import StrongholdViewer from './StrongholdViewer.svelte';
import { SvelteApplication, type SvelteAppOptions } from '../foundry/ApplicationBase';

export class StrongholdViewerApp extends SvelteApplication {}

export function openStrongholdViewer() {
  const opts: SvelteAppOptions = { id: 'stronghold-viewer', title: 'Party Strongholds', svelte: StrongholdViewer };
  return new StrongholdViewerApp(opts as any).render(true);
}


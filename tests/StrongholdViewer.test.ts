import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import StrongholdViewer from '../src/apps/StrongholdViewer.svelte';

// Minimal Foundry shims
class MockApp<T = any> {
  static get defaultOptions() { return {}; }
  options: any = {};
  render() { return this as any; }
}

beforeEach(() => {
  vi.resetModules();
  (globalThis as any).Application = MockApp as any;
  (globalThis as any).Hooks = { on: vi.fn(), once: vi.fn() };
  (globalThis as any).ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
  (globalThis as any).game = {
    system: { id: 'dnd5e' },
    user: { isGM: true, character: { name: 'Hero', system: { details: { level: 5 } }, classes: { fighter: {} } } },
    settings: {
      get: vi.fn().mockImplementation((mod: string, key: string) => {
        if (mod === 'strongholds-and-followers' && key === 'strongholds') {
          return {
            a1: {
              id: 'a1', name: 'Keep of Dawn', type: 'keep', classFlavor: 'fighter', level: 2,
              description: 'A sturdy keep.', active: true, createdBy: 'gm', createdDate: 'now', buildingCost: 50000, totalCostPaid: 60000,
              bonuses: [ { id: 'b1', name: 'Drills', description: '+1 to something', partyWide: false, addedDate: 'now' } ]
            }
          };
        }
        return {};
      })
    },
    socket: { emit: vi.fn() }
  };
});

describe('StrongholdViewer', () => {
  it('renders active strongholds and allows refresh', async () => {
    const { container } = render(StrongholdViewer);
    expect(container.querySelector('.viewer-header')).toBeTruthy();
    expect(container.innerHTML).toContain('Keep of Dawn');
    const refresh = container.querySelector('.refresh-bonuses') as HTMLButtonElement;
    expect(refresh).toBeTruthy();
    await fireEvent.click(refresh);
    expect((globalThis as any).game.settings.get).toHaveBeenCalled();
  });

  it('shows GM-only reload button when isGM', async () => {
    const { container } = render(StrongholdViewer);
    const reload = container.querySelector('.reload-clients') as HTMLButtonElement;
    expect(reload).toBeTruthy();
  });
});


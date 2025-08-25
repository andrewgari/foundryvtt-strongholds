import { describe, it, expect, beforeEach, vi } from 'vitest';

// Arrange common mocks
class MockApp<T = any> {
  static get defaultOptions() {
    return {};
  }
  options: any = {};
  render() {
    return this as any;
  }
}

beforeEach(() => {
  vi.resetModules();
  (globalThis as any).Application = MockApp as any;
  (globalThis as any).Hooks = {
    _events: new Map<string, Function[]>(),
    on: (name: string, fn: Function) => {
      const arr = Hooks._events.get(name) ?? [];
      arr.push(fn);
      Hooks._events.set(name, arr);
    },
    once: (name: string, fn: Function) => {
      const arr = Hooks._events.get(name) ?? [];
      arr.push(fn);
      Hooks._events.set(name, arr);
    },
  };
  (globalThis as any).game = { user: { isGM: false } };
});

async function importMain() {
  await import('../src/main');
}

function runGetSceneControls() {
  const handlers = (globalThis as any).Hooks._events.get('getSceneControlButtons') || [];
  const controls: any[] = [];
  for (const fn of handlers) fn(controls);
  return controls;
}

describe('Foundry integration', () => {
  it('registers scene control button set', async () => {
    // Arrange
    await importMain();

    // Act
    const controls = runGetSceneControls();

    // Assert
    const strongholds = controls.find((c: any) => c.name === 'strongholds');
    expect(strongholds).toBeTruthy();
    expect(strongholds.icon).toBe('fas fa-home');
    expect(Array.isArray(strongholds.tools)).toBe(true);
    // House button should not be a direct button (only expands sub-tools)
    expect(strongholds.button).toBeUndefined();
  });

  it('shows GM-only tool only when isGM', async () => {
    // Arrange
    await importMain();

    // Act: player
    (globalThis as any).game.user.isGM = false;
    let controls = runGetSceneControls();
    let strongholds = controls.find((c: any) => c.name === 'strongholds');
    expect(strongholds).toBeTruthy();
    expect(strongholds.tools.some((t: any) => t?.name === 'manage')).toBe(false);

    // Act: GM
    (globalThis as any).game.user.isGM = true;
    controls = runGetSceneControls();
    strongholds = controls.find((c: any) => c.name === 'strongholds');
    expect(strongholds).toBeTruthy();
    expect(strongholds.tools.some((t: any) => t?.name === 'manage')).toBe(true);
  });

  it('Applications instantiate without error', async () => {
    // Arrange
    await importMain();
    const controls = runGetSceneControls();
    const strongholds = controls.find((c: any) => c.name === 'strongholds');
    expect(strongholds).toBeTruthy();

    // Act
    const view = strongholds.tools.find((t: any) => t.name === 'view');
    const edit = strongholds.tools.find((t: any) => t.name === 'manage') || { onClick: () => {} };

    // Assert (no throws)
    expect(() => view.onClick()).not.toThrow();
    expect(() => edit.onClick()).not.toThrow();
  });
});

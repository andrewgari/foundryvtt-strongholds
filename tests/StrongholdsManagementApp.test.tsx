import { describe, it, expect, beforeEach } from 'vitest';

// We test that the ApplicationV2-based class can instantiate and provide context data

declare const Hooks: any;

class MockApp<T = any> {
  static get defaultOptions() {
    return {};
  }
  options: any = {};
  render() {
    return this as any;
  }
}

// Minimal Foundry mocks
beforeEach(() => {
  (globalThis as any).Application = MockApp as any;
  (globalThis as any).foundry = {
    applications: { api: {} },
    utils: { mergeObject: (a: any, b: any) => ({ ...a, ...b }) },
  } as any;
  (globalThis as any).game = {
    user: { isGM: true },
    settings: { get: () => ({}), set: async () => {} },
  } as any;
});

describe('StrongholdsManagementApp (ApplicationV2)', () => {
  it('imports and instantiates', async () => {
    const mod = await import('../src/apps/StrongholdsManagementApp');
    const Cls = mod.StrongholdsManagementApp;
    const inst = new Cls();
    expect(inst).toBeTruthy();
    const ctx = await (inst as any)._prepareContext?.();
    expect(ctx).toHaveProperty('isGM');
    expect(ctx).toHaveProperty('items');
  });
});

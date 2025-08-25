import { describe, it, expect } from 'vitest';

// Mock Foundry Application base to avoid ReferenceError before dynamic import
(globalThis as any).Application = class Application<T = any> {
  static get defaultOptions() {
    return {};
  }
  options: any = {};
  render() {
    return this as any;
  }
};

// Dynamically import after mocks are in place
let imported = false;

describe('Foundry hooks', () => {
  it('registers handlers without error', async () => {
    if (!imported) {
      await import('../src/main');
      imported = true;
    }
    expect(true).toBe(true);
  });
});

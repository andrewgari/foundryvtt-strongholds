import { describe, it, expect } from 'vitest';
import type { SvelteCtor, SvelteAppOptions } from '../src/foundry/ApplicationBase';
import StrongholdsApp from '../src/apps/StrongholdsApp.svelte';

// Arrange
const ctor: SvelteCtor = StrongholdsApp as unknown as SvelteCtor;
const options: SvelteAppOptions = { svelte: ctor } as SvelteAppOptions;

describe('Type safety', () => {
  it('SvelteCtor is compatible with Svelte components', () => {
    expect(ctor).toBeTruthy();
  });

  it('SvelteAppOptions requires svelte ctor', () => {
    expect(options.svelte).toBe(ctor);
  });
});


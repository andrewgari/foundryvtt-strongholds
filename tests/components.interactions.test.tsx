import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import StrongholdsApp from '../src/apps/StrongholdsApp.svelte';
import StrongholdsManagementApp from '../src/apps/StrongholdsManagementApp.svelte';

describe('Component interactions (client-friendly)', () => {
  it('StrongholdsApp renders with different props', async () => {
    // Arrange
    const { getByText, rerender } = render(StrongholdsApp as any, { props: { name: 'Strongholds' } });

    // Assert
    expect(getByText('Strongholds')).toBeTruthy();

    // Act
    await rerender({ name: 'Castles' } as any);

    // Assert
    expect(getByText('Castles')).toBeTruthy();
  });

  it('StrongholdsManagementApp renders text', () => {
    const { getByText } = render(StrongholdsManagementApp as any, { props: { name: 'Strongholds Management' } });
    expect(getByText('Strongholds Management')).toBeTruthy();
  });
});


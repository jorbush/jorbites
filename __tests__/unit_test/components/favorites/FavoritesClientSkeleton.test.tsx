import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import FavoritesClientSkeleton from '@/app/components/favorites/FavoritesClientSkeleton';

describe('FavoritesClientSkeleton', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders header, dropdown, and recipe card skeleton placeholders', () => {
        const { container } = render(<FavoritesClientSkeleton />);

        // Should have animated pulse placeholders
        const pulseElements = container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThanOrEqual(15);

        // Should contain the recipe grid
        const grid = container.querySelector('.grid');
        expect(grid).toBeDefined();
    });
});

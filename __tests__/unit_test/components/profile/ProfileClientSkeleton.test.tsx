import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ProfileClientSkeleton from '@/app/components/profile/ProfileClientSkeleton';

describe('ProfileClientSkeleton Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders tabs, dropdown, and card grid skeleton placeholders', () => {
        const { container } = render(<ProfileClientSkeleton />);

        // Check that tabs and card grid skeleton blocks are rendered
        const pulseElements = container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThanOrEqual(15);

        const grid = container.querySelector('.grid');
        expect(grid?.className).toContain('grid-cols-1');
        expect(grid?.className).toContain('md:grid-cols-3');
        expect(grid?.className).not.toContain('sm:grid-cols-2');
    });
});

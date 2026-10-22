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
    });
});

import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ProfileHeaderSkeleton from '@/app/components/profile/ProfileHeaderSkeleton';

describe('ProfileHeaderSkeleton Component', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders avatar, identity, bio, backlinks, and badges skeleton placeholders', () => {
        const { container } = render(<ProfileHeaderSkeleton />);

        // Check that pulse animations are present across skeleton blocks
        const pulseElements = container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThanOrEqual(15);
    });
});

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LikesClientSkeleton from '@/app/recipes/[recipeId]/likes/LikesClientSkeleton';

describe('LikesClientSkeleton', () => {
    it('renders skeleton placeholders correctly', () => {
        const { container } = render(<LikesClientSkeleton />);
        expect(container).toBeDefined();
        const pulseElements = container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThan(0);
    });
});

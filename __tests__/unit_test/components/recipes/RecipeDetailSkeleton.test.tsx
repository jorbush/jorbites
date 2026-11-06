import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import RecipeDetailSkeleton from '@/app/components/recipes/RecipeDetailSkeleton';

describe('RecipeDetailSkeleton', () => {
    it('renders recipe detail skeleton placeholders correctly', () => {
        const { container } = render(<RecipeDetailSkeleton />);
        expect(container).toBeDefined();
        const pulseElements = container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThan(0);
    });
});

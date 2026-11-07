import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CulinaryActionVisualizer from '@/app/components/recipes/CookingGuide/CulinaryActionVisualizer';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) =>
            options?.defaultValue || key,
    }),
}));

describe('CulinaryActionVisualizer', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders detected action label and 1-indexed step badge when incomplete', () => {
        render(
            <CulinaryActionVisualizer
                action="bake"
                isCompleted={false}
                stepIndex={2}
            />
        );

        const visualizer = screen.getByTestId('culinary-action-visualizer');
        expect(visualizer.getAttribute('data-action')).toBe('bake');
        expect(screen.getByText('Oven & Baking')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined();
    });

    it('renders Step Completed badge when isCompleted is true', () => {
        render(
            <CulinaryActionVisualizer
                action="mix"
                isCompleted={true}
                stepIndex={0}
            />
        );

        expect(screen.getByText('Step Completed')).toBeDefined();
        expect(screen.getByText('1')).toBeDefined();
    });
});

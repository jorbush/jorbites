import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import PlanningsHeader from '@/app/components/plannings/PlanningsHeader';

describe('PlanningsHeader', () => {
    const t = (key: string) => key;
    const onCreateClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders header titles and create button', () => {
        render(
            <PlanningsHeader
                onCreateClick={onCreateClick}
                t={t}
            />
        );

        expect(screen.getByText('meal_planner')).toBeDefined();
        expect(screen.getByText('create_meal_plan')).toBeDefined();
    });

    it('triggers onCreateClick when create button is clicked', () => {
        render(
            <PlanningsHeader
                onCreateClick={onCreateClick}
                t={t}
            />
        );

        const createButton = screen.getByTestId('create-meal-plan-button');
        fireEvent.click(createButton);

        expect(onCreateClick).toHaveBeenCalledTimes(1);
    });
});

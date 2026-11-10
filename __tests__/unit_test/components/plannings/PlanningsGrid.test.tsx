import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import PlanningsGrid from '@/app/components/plannings/PlanningsGrid';
import { SafePlanning, SafeUser } from '@/app/types';

vi.mock('@/app/components/plannings/PlanningCard', () => ({
    PlanningCard: ({
        plan,
        showDelete,
        isSavedTab,
        showPublicBadge,
    }: {
        plan: any;
        showDelete?: boolean;
        isSavedTab?: boolean;
        showPublicBadge?: boolean;
    }) => (
        <div data-testid={`planning-card-${plan.id}`}>
            <span>{plan.name}</span>
            {showDelete && <span data-testid="show-delete-badge" />}
            {isSavedTab && <span data-testid="is-saved-badge" />}
            {showPublicBadge && <span data-testid="show-public-badge" />}
        </div>
    ),
}));

describe('PlanningsGrid', () => {
    const mockUser: SafeUser = {
        id: 'user-1',
        name: 'Chef Jordi',
        image: null,
        level: 1,
        verified: false,
        badges: [],
    };

    const mockPlans: SafePlanning[] = [
        {
            id: 'plan-1',
            name: 'Keto Diet',
            description: 'Low carb',
            userId: 'user-1',
            isPrivate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: mockUser,
            meals: [],
        },
        {
            id: 'plan-2',
            name: 'Vegan Week',
            description: 'Plant based',
            userId: 'user-2',
            isPrivate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: mockUser,
            meals: [],
        },
    ];

    const t = (key: string) => key;
    const onUnsave = vi.fn().mockResolvedValue(undefined);
    const onDeleteClick = vi.fn();
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders empty state when plans array is empty', () => {
        render(
            <PlanningsGrid
                plans={[]}
                currentUser={mockUser}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        expect(screen.getByText('no_meal_plans')).toBeDefined();
        expect(screen.queryByTestId('planning-card-plan-1')).toBeNull();
    });

    it('renders list of planning cards when plans are provided', () => {
        render(
            <PlanningsGrid
                plans={mockPlans}
                currentUser={mockUser}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        expect(screen.getByTestId('planning-card-plan-1')).toBeDefined();
        expect(screen.getByTestId('planning-card-plan-2')).toBeDefined();
        expect(screen.getByText('Keto Diet')).toBeDefined();
        expect(screen.getByText('Vegan Week')).toBeDefined();
    });

    it('passes showDelete and isSavedTab flags correctly to cards', () => {
        render(
            <PlanningsGrid
                plans={mockPlans}
                currentUser={mockUser}
                showDelete={true}
                isSavedTab={true}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        const deleteBadges = screen.getAllByTestId('show-delete-badge');
        expect(deleteBadges.length).toBe(2);

        const savedBadges = screen.getAllByTestId('is-saved-badge');
        expect(savedBadges.length).toBe(2);
    });

    it('passes showPublicBadge flag correctly to cards', () => {
        render(
            <PlanningsGrid
                plans={mockPlans}
                currentUser={mockUser}
                showPublicBadge={true}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        const publicBadges = screen.getAllByTestId('show-public-badge');
        expect(publicBadges.length).toBe(2);
    });
});

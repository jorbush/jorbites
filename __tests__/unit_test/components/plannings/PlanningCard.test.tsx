import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { PlanningCard } from '@/app/components/plannings/PlanningCard';

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar" />,
}));

vi.mock('@/app/utils/date-utils', () => ({
    formatDate: (date: any, lang: string) => `formatted-date-${lang}`,
}));

describe('PlanningCard', () => {
    const mockPlan = {
        id: 'plan-123',
        name: 'My Meal Plan',
        description: 'Nice description',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        isPrivate: false,
        meals: [
            {
                id: 'meal-1',
                recipe: {
                    id: 'recipe-1',
                    title: 'Recipe 1',
                    imageSrc: 'img1.png',
                },
            },
            {
                id: 'meal-2',
                recipe: {
                    id: 'recipe-2',
                    title: 'Recipe 2',
                    imageSrc: 'img2.png',
                },
            },
        ],
        user: {
            id: 'user-1',
            name: 'John Doe',
            image: 'john.png',
        },
    } as any;

    const t = (key: string) => key;
    const push = vi.fn();
    const onUnsave = vi.fn();
    const onDeleteClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders basic info correctly', () => {
        render(
            <PlanningCard
                plan={mockPlan}
                currentUser={null}
                showDelete={false}
                isSavedTab={false}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        expect(screen.getByText('My Meal Plan')).toBeDefined();
        expect(screen.getByText('Nice description')).toBeDefined();
        expect(screen.getByText('2 meals')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('formatted-date-en')).toBeDefined();
        expect(screen.getByAltText('Recipe 1')).toBeDefined();
        expect(screen.getByAltText('Recipe 2')).toBeDefined();
    });

    it('handles redirect to details on click', () => {
        render(
            <PlanningCard
                plan={mockPlan}
                currentUser={null}
                showDelete={false}
                isSavedTab={false}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        fireEvent.click(screen.getByText('My Meal Plan'));
        expect(push).toHaveBeenCalledWith('/plannings/plan-123');
    });

    it('calls onDeleteClick when delete is triggered by owner', () => {
        render(
            <PlanningCard
                plan={mockPlan}
                currentUser={{ id: 'user-1' } as any}
                showDelete={true}
                isSavedTab={false}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        const deleteBtn = screen.getByRole('button', { name: 'delete' });
        fireEvent.click(deleteBtn);
        expect(onDeleteClick).toHaveBeenCalledWith('plan-123');
        expect(onUnsave).not.toHaveBeenCalled();
    });

    it('calls onUnsave when delete is triggered on saved tab for non-owned plan', () => {
        render(
            <PlanningCard
                plan={mockPlan}
                currentUser={{ id: 'user-2' } as any}
                showDelete={true}
                isSavedTab={true}
                onUnsave={onUnsave}
                onDeleteClick={onDeleteClick}
                push={push}
                t={t}
                language="en"
            />
        );

        const deleteBtn = screen.getByRole('button', { name: 'delete' });
        fireEvent.click(deleteBtn);
        expect(onUnsave).toHaveBeenCalledWith('plan-123');
        expect(onDeleteClick).not.toHaveBeenCalled();
    });
});

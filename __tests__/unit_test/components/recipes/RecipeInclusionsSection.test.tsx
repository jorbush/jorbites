import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeInclusionsSection from '@/app/components/recipes/RecipeInclusionsSection';
import { useRecipeInclusions } from '@/app/hooks/useRecipeInclusions';
import { SafeList, SafePlanning, SafeUser } from '@/app/types';

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useRecipeInclusions');

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'included_in_lists_and_plannings')
                return 'Lists & Meal Plans';
            if (key === 'included_lists_tab')
                return `Lists (${options?.count})`;
            if (key === 'included_plannings_tab')
                return `Meal Plans (${options?.count})`;
            return options?.defaultValue || key;
        },
        i18n: {
            language: 'en',
        },
    }),
}));

vi.mock('@/app/components/lists/ListCard', () => ({
    ListCard: ({ list }: { list: any }) => (
        <div data-testid={`mock-list-card-${list.id}`}>{list.name}</div>
    ),
}));

vi.mock('@/app/components/plannings/PlanningCard', () => ({
    PlanningCard: ({ plan }: { plan: any }) => (
        <div data-testid={`mock-planning-card-${plan.id}`}>{plan.name}</div>
    ),
}));

describe('RecipeInclusionsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockUser: SafeUser = {
        id: 'user-1',
        name: 'Alex',
        email: 'alex@test.com',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        favoriteIds: [],
        savedPlanningIds: [],
        pinnedRecipeIds: [],
        badges: [],
        emailNotifications: false,
        level: 3,
        verified: false,
    };

    const mockLists: SafeList[] = [
        {
            id: 'list-1',
            name: 'Comfort Food',
            isPrivate: false,
            isDefault: false,
            userId: 'user-1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            recipes: [],
        },
    ];

    const mockPlannings: SafePlanning[] = [
        {
            id: 'plan-1',
            name: 'Weekly Meal Prep',
            isPrivate: false,
            userId: 'user-1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            meals: [],
        },
    ];

    it('returns null while loading', () => {
        vi.mocked(useRecipeInclusions).mockReturnValue({
            lists: [],
            plannings: [],
            isLoading: true,
            error: null,
            mutate: vi.fn(),
        });

        const { container } = render(
            <RecipeInclusionsSection
                recipeId="recipe-123"
                currentUser={mockUser}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('returns null when both lists and plannings are empty', () => {
        vi.mocked(useRecipeInclusions).mockReturnValue({
            lists: [],
            plannings: [],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        const { container } = render(
            <RecipeInclusionsSection
                recipeId="recipe-123"
                currentUser={mockUser}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders lists grid when only lists exist (no tabs needed)', () => {
        vi.mocked(useRecipeInclusions).mockReturnValue({
            lists: mockLists,
            plannings: [],
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        render(
            <RecipeInclusionsSection
                recipeId="recipe-123"
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('Lists & Meal Plans')).toBeInTheDocument();
        expect(screen.getByTestId('mock-list-card-list-1')).toBeInTheDocument();
        expect(
            screen.queryByTestId('inclusions-tab-lists')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('inclusions-tab-plannings')
        ).not.toBeInTheDocument();
    });

    it('renders plannings grid when only plannings exist (no tabs needed)', () => {
        vi.mocked(useRecipeInclusions).mockReturnValue({
            lists: [],
            plannings: mockPlannings,
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        render(
            <RecipeInclusionsSection
                recipeId="recipe-123"
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('Lists & Meal Plans')).toBeInTheDocument();
        expect(
            screen.getByTestId('mock-planning-card-plan-1')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('inclusions-tab-lists')
        ).not.toBeInTheDocument();
    });

    it('renders tabs when both lists and plannings exist and switches between them', () => {
        vi.mocked(useRecipeInclusions).mockReturnValue({
            lists: mockLists,
            plannings: mockPlannings,
            isLoading: false,
            error: null,
            mutate: vi.fn(),
        });

        render(
            <RecipeInclusionsSection
                recipeId="recipe-123"
                currentUser={mockUser}
            />
        );

        // Header and tabs exist
        expect(screen.getByText('Lists & Meal Plans')).toBeInTheDocument();
        const listsTab = screen.getByTestId('inclusions-tab-lists');
        const planningsTab = screen.getByTestId('inclusions-tab-plannings');
        expect(listsTab).toBeInTheDocument();
        expect(planningsTab).toBeInTheDocument();

        // Defaults to lists tab
        expect(screen.getByTestId('mock-list-card-list-1')).toBeInTheDocument();
        expect(
            screen.queryByTestId('mock-planning-card-plan-1')
        ).not.toBeInTheDocument();

        // Click on Plannings tab
        fireEvent.click(planningsTab);
        expect(
            screen.getByTestId('mock-planning-card-plan-1')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('mock-list-card-list-1')
        ).not.toBeInTheDocument();

        // Click back to Lists tab
        fireEvent.click(listsTab);
        expect(screen.getByTestId('mock-list-card-list-1')).toBeInTheDocument();
    });
});

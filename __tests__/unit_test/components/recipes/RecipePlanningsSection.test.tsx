import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipePlanningsSection from '@/app/components/recipes/RecipePlanningsSection';
import { SafePlanning } from '@/app/types';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'included_in_plannings')
                return 'Included in Meal Plans';
            return options?.defaultValue || key;
        },
        i18n: { language: 'en' },
    }),
}));

vi.mock('@/app/components/plannings/PlanningCard', () => ({
    PlanningCard: ({ plan }: { plan: SafePlanning }) => (
        <div data-testid="mock-planning-card">{plan.name}</div>
    ),
}));

describe('RecipePlanningsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockPlannings: SafePlanning[] = [
        {
            id: 'plan-1',
            name: 'Low Carb Week',
            description: 'Healthy lunches',
            isPrivate: false,
            userId: 'user-1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            meals: [],
        },
    ];

    it('returns null when plannings array is empty', () => {
        const { container } = render(<RecipePlanningsSection plannings={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders section title and planning cards when plannings are present', () => {
        render(<RecipePlanningsSection plannings={mockPlannings} />);

        expect(
            screen.getByTestId('recipe-plannings-section')
        ).toBeInTheDocument();
        expect(screen.getByText('Included in Meal Plans')).toBeInTheDocument();
        expect(screen.getAllByTestId('mock-planning-card')).toHaveLength(1);
        expect(screen.getByText('Low Carb Week')).toBeInTheDocument();
    });
});

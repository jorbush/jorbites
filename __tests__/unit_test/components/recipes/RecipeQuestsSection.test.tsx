import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeQuestsSection from '@/app/components/recipes/RecipeQuestsSection';
import { SafeQuest } from '@/app/types';

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
            if (key === 'associated_quests') return 'Associated Quests';
            return options?.defaultValue || key;
        },
        i18n: { language: 'en' },
    }),
}));

vi.mock('@/app/components/quests/QuestCard', () => ({
    QuestCard: ({ quest }: { quest: SafeQuest }) => (
        <div data-testid="mock-quest-card">{quest.title}</div>
    ),
}));

describe('RecipeQuestsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockQuests: SafeQuest[] = [
        {
            id: 'quest-1',
            title: 'Crispy Smashed Potatoes',
            description: 'Need the ultimate crispy potato technique',
            status: 'completed',
            userId: 'user-1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            acceptedRecipeId: 'recipe-1',
            acceptedSolverId: 'solver-1',
            badgeEvaluated: true,
        },
    ];

    it('returns null when quests array is empty', () => {
        const { container } = render(<RecipeQuestsSection quests={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders section title and quest cards when quests are present', () => {
        render(<RecipeQuestsSection quests={mockQuests} />);

        expect(screen.getByTestId('recipe-quests-section')).toBeInTheDocument();
        expect(screen.getByText('Associated Quests')).toBeInTheDocument();
        expect(screen.getAllByTestId('mock-quest-card')).toHaveLength(1);
        expect(screen.getByText('Crispy Smashed Potatoes')).toBeInTheDocument();
    });
});

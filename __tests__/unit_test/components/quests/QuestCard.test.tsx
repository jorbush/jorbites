import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestCard from '@/app/components/quests/QuestCard';
import { SafeQuest } from '@/app/types';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'no_description') return 'No description';
            if (key === 'anonymous') return 'Anonymous';
            if (key === 'reply') return 'reply';
            if (key === 'replies') return 'replies';
            return options?.defaultValue || key;
        },
        i18n: { language: 'en' },
    }),
}));

vi.mock('@/app/utils/date-utils', () => ({
    formatDistanceToNowLocale: () => '2 days ago',
}));

vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src }: { src: string | null }) => (
        <div data-testid="mock-avatar">{src || 'avatar-placeholder'}</div>
    ),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe('QuestCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockQuest: SafeQuest = {
        id: 'quest-123',
        title: 'Craving Authentic Ramen',
        description: 'Looking for a rich tonkotsu broth recipe from scratch',
        status: 'open',
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
        acceptedRecipeId: null,
        acceptedSolverId: null,
        badgeEvaluated: false,
        userId: 'user-1',
        user: {
            id: 'user-1',
            name: 'Naruto',
            email: 'naruto@example.com',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            favoriteIds: [],
            savedPlanningIds: [],
            pinnedRecipeIds: [],
            badges: [],
            emailNotifications: false,
            level: 5,
            verified: true,
        },
        recipes: [
            {
                id: 'recipe-1',
                title: 'Tonkotsu Ramen',
                imageSrc: 'ramen.jpg',
            } as any,
        ],
    };

    it('renders quest title, status, description, and author', () => {
        render(<QuestCard quest={mockQuest} />);

        expect(screen.getByText('Craving Authentic Ramen')).toBeInTheDocument();
        expect(screen.getByText('open')).toBeInTheDocument();
        expect(
            screen.getByText(
                'Looking for a rich tonkotsu broth recipe from scratch'
            )
        ).toBeInTheDocument();
        expect(screen.getByText('Naruto')).toBeInTheDocument();
        expect(screen.getByText('2 days ago')).toBeInTheDocument();
        expect(screen.getByText('1 reply')).toBeInTheDocument();
    });

    it('renders fallback for empty description', () => {
        const questWithoutDesc: SafeQuest = {
            ...mockQuest,
            description: '',
        };

        render(<QuestCard quest={questWithoutDesc} />);

        expect(screen.getByText('No description')).toBeInTheDocument();
    });

    it('navigates to quest detail when clicked', () => {
        const customPush = vi.fn();
        render(
            <QuestCard
                quest={mockQuest}
                push={customPush}
            />
        );

        const titleLink = screen.getByRole('link', {
            name: /Craving Authentic Ramen/i,
        });
        fireEvent.click(titleLink);

        expect(customPush).toHaveBeenCalledWith('/quests/quest-123');
    });

    it('renders replies preview when showRepliesPreview is true', () => {
        render(
            <QuestCard
                quest={mockQuest}
                showRepliesPreview={true}
            />
        );

        const recipeLink = screen.getByRole('link', {
            name: /Tonkotsu Ramen/i,
        });
        expect(recipeLink).toBeInTheDocument();
    });
});

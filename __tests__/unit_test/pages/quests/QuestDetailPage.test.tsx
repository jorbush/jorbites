import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QuestDetailClient from '@/app/quests/[questId]/QuestDetailClient';

// Mock dependencies
const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRefresh = vi.fn();

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
        refresh: mockRefresh,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
            language: 'en',
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn(),
    },
}));

vi.mock('@/app/hooks/useQuestModal', () => ({
    default: () => ({
        onOpenEdit: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: () => ({
        onOpenCreate: vi.fn(),
    }),
}));

vi.mock('date-fns', () => ({
    formatDistance: () => '2 hours ago',
}));

vi.mock('axios');

describe('<QuestDetailClient />', () => {
    const mockQuest = {
        id: 'quest1',
        title: 'Test Quest',
        description: 'Test description for the quest',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
            id: 'user1',
            name: 'Quest Owner',
            image: null,
            verified: false,
        },
        recipes: [
            {
                id: 'recipe1',
                title: 'Test Recipe',
                description: 'Test recipe description',
                imageSrc: '/test.jpg',
                categories: ['Dinner'],
                method: 'Oven',
                minutes: 30,
                numLikes: 5,
                ingredients: ['ingredient1', 'ingredient2'],
                steps: ['step1', 'step2'],
                extraImages: [],
                userId: 'user2',
                coCooksIds: [],
                linkedRecipeIds: [],
                youtubeUrl: null,
                questId: 'quest1',
                createdAt: new Date().toISOString(),
                user: {
                    id: 'user2',
                    name: 'Recipe Author',
                    image: null,
                    verified: false,
                },
            },
        ],
    };

    const mockUser = {
        id: 'user1',
        name: 'Quest Owner',
        email: 'owner@example.com',
        image: null,
        favoriteIds: [],
        emailNotifications: true,
        createdAt: '2022-01-01',
        level: 1,
        numRecipes: 0,
        badgeIds: [],
        isActive: true,
        lastActiveAt: '2022-01-01',
        resetToken: null,
        resetTokenExpiry: null,
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the quest detail page', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        expect(screen.getByText('Test Quest')).toBeDefined();
        expect(
            screen.getByText('Test description for the quest')
        ).toBeDefined();
    });

    it('renders the back button', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        const backButton = screen.getByText('back');
        expect(backButton).toBeDefined();
    });

    it('calls router.back() when back button is clicked', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        const backButton = screen.getByText('back');
        fireEvent.click(backButton);
        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('renders share button for all users', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        const shareButton = screen.getByLabelText(/share_quest/i);
        expect(shareButton).toBeDefined();
    });

    it('renders share button for non-owner', () => {
        const otherUser = { ...mockUser, id: 'user999' };
        render(
            <QuestDetailClient
                currentUser={otherUser}
                quest={mockQuest}
            />
        );
        const shareButton = screen.getByLabelText(/share_quest/i);
        expect(shareButton).toBeDefined();
    });

    it('calls copyToClipboard when share button is clicked and navigator.share is not available', () => {
        const writeTextMock = vi.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock,
            },
            share: undefined,
        });

        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        const shareButton = screen.getByLabelText(/share_quest/i);
        fireEvent.click(shareButton);
        expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    it('renders edit and delete buttons for quest owner', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        const buttons = screen.getAllByRole('button');
        // Should have back, share, edit, delete, and fulfill quest buttons
        expect(buttons.length).toBeGreaterThanOrEqual(5);
    });

    it('does not render edit and delete buttons for non-owner', () => {
        const otherUser = { ...mockUser, id: 'user999' };
        render(
            <QuestDetailClient
                currentUser={otherUser}
                quest={mockQuest}
            />
        );
        const buttons = screen.getAllByRole('button');
        // Should have back, share, and fulfill quest buttons only
        expect(buttons.length).toBeLessThan(5);
    });

    it('opens delete confirmation modal when delete button is clicked', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        const deleteButton = screen.getAllByRole('button')[3]; // Fourth button (share, edit, then delete)
        fireEvent.click(deleteButton);

        // Check if confirm modal text appears
        expect(screen.getByText('confirm_title')).toBeDefined();
    });

    it('renders fulfill quest button when user is logged in and quest is not completed', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        expect(screen.getByText('fulfill_quest')).toBeDefined();
    });

    it('does not render fulfill quest button when quest is completed', () => {
        const completedQuest = { ...mockQuest, status: 'completed' };
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={completedQuest}
            />
        );
        const fulfillButton = screen.queryByText('fulfill_quest');
        expect(fulfillButton).toBeNull();
    });

    it('renders recipe replies section', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        expect(screen.getByText(/recipe_replies/)).toBeDefined();
    });

    it('displays correct number of recipe replies', () => {
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={mockQuest}
            />
        );
        // Should show "Recipe Replies (1)"
        expect(screen.getByText(/1/)).toBeDefined();
    });

    it('renders empty state when no recipes', () => {
        const questWithoutRecipes = { ...mockQuest, recipes: [] };
        render(
            <QuestDetailClient
                currentUser={mockUser}
                quest={questWithoutRecipes}
            />
        );
        expect(screen.getByText('no_recipes_yet')).toBeDefined();
    });
});

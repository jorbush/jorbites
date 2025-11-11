import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QuestsClient from '@/app/quests/QuestsClient';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useQuestModal', () => ({
    default: () => ({
        onOpenCreate: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({
        onOpen: vi.fn(),
    }),
}));

vi.mock('date-fns', () => ({
    formatDistance: () => '2 hours ago',
}));

describe('<QuestsClient />', () => {
    const mockQuests = [
        {
            id: '1',
            title: 'Test Quest 1',
            description: 'Test description 1',
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
                id: 'user1',
                name: 'Test User',
                image: null,
                verified: false,
            },
            recipes: [],
        },
        {
            id: '2',
            title: 'Test Quest 2',
            description: 'Test description 2',
            status: 'in_progress',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
                id: 'user2',
                name: 'Test User 2',
                image: null,
                verified: false,
            },
            recipes: [
                {
                    id: 'recipe1',
                    title: 'Test Recipe',
                    imageSrc: '/test.jpg',
                    user: {
                        id: 'user3',
                        name: 'Chef User',
                        image: null,
                    },
                },
            ],
        },
    ];

    const mockUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
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

    it('renders the quests page title', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByText('quests')).toBeDefined();
    });

    it('renders the request recipe button when user is logged in', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        // Should have both desktop and mobile buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders the request recipe button even when user is not logged in', () => {
        render(
            <QuestsClient
                currentUser={null}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        // Should have both desktop and mobile buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders all quests', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByText('Test Quest 1')).toBeDefined();
        expect(screen.getByText('Test Quest 2')).toBeDefined();
    });

    it('renders quest status badges', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        // Use getAllByText since status appears in both filter buttons and badges
        const openTexts = screen.getAllByText('open');
        expect(openTexts.length).toBeGreaterThan(0);
        const inProgressTexts = screen.getAllByText('in_progress');
        expect(inProgressTexts.length).toBeGreaterThan(0);
    });

    it('displays recipe reply counts', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        // Quest 1 has 0 replies
        const repliesText = screen.getByText(/0.*replies/);
        expect(repliesText).toBeDefined();
        // Quest 2 has 1 reply
        const replyText = screen.getByText(/1.*reply/);
        expect(replyText).toBeDefined();
    });

    it('renders filter buttons', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        const filterButtons = screen.getAllByRole('button');
        // Should have: all, open, in_progress, completed, desktop request button, and mobile FAB
        expect(filterButtons.length).toBeGreaterThanOrEqual(6);
    });

    it('renders mobile floating action button', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={mockQuests}
                totalPages={1}
                currentPage={1}
            />
        );
        // Find the mobile FAB by its unique data-cy attribute
        const buttons = screen.getAllByRole('button');
        const mobileFab = buttons.find(
            (button) =>
                button.getAttribute('data-cy') ===
                'request-recipe-button-mobile'
        );
        expect(mobileFab).toBeDefined();
    });

    it('renders empty state when no quests are provided', () => {
        render(
            <QuestsClient
                currentUser={mockUser}
                quests={[]}
                totalPages={1}
                currentPage={1}
            />
        );
        expect(screen.getByText('no_quests')).toBeDefined();
    });
});

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import TopRecipeVoting from '@/app/components/events/TopRecipeVoting';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock CustomProxyImage
vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img
            src={src}
            alt={alt}
            data-testid="mock-proxy-image"
        />
    ),
}));

// Mock Avatar
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src }: { src: string | null | undefined }) => (
        <div
            data-testid="mock-avatar"
            data-src={src || '/images/placeholder.webp'}
        />
    ),
}));

// Mock Next/Link
vi.mock('next/link', () => ({
    default: ({
        href,
        children,
    }: {
        href: string;
        children: React.ReactNode;
    }) => (
        <a
            href={href}
            data-testid="mock-link"
        >
            {children}
        </a>
    ),
}));

describe('TopRecipeVoting Component', () => {
    const mockMutate = vi.fn().mockResolvedValue({});
    const mockSession = {
        id: 'session-123',
        periodKey: '2026-W26',
        candidates: [
            {
                id: 'recipe-1',
                title: 'Delicious Salad',
                imageSrc: '/salad.webp',
                numLikes: 12,
                voteCount: 5,
                user: {
                    name: 'Chef Green',
                    image: '/avatars/chef-green.webp',
                },
            },
            {
                id: 'recipe-2',
                title: 'Beef Steak',
                imageSrc: '/steak.webp',
                numLikes: 8,
                voteCount: 3,
                user: {
                    name: 'Chef Brown',
                    image: null,
                },
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders candidate details correctly, including custom user images', () => {
        render(
            <TopRecipeVoting
                category="week"
                session={mockSession}
                userVote={null}
                mutate={mockMutate}
            />
        );

        // Check translation keys are rendered
        expect(screen.getByText('recipe_of_the_week_voting')).toBeDefined();
        expect(screen.getByText(/voting_period/)).toBeDefined();
        expect(screen.getByText(/live_voting/)).toBeDefined();

        // Check candidate 1 info
        expect(screen.getByText('Delicious Salad')).toBeDefined();
        expect(screen.getByText('Chef Green')).toBeDefined();

        // Check candidate 1 user image rendered via Avatar component
        const avatars = screen.getAllByTestId('mock-avatar');
        expect(avatars).toHaveLength(2);
        expect(avatars[0].getAttribute('data-src')).toBe(
            '/avatars/chef-green.webp'
        );
        expect(avatars[1].getAttribute('data-src')).toBe(
            '/images/placeholder.webp'
        );

        // Check recipe proxy images
        const proxyImages = screen.getAllByTestId('mock-proxy-image');
        expect(proxyImages).toHaveLength(2);
        expect(proxyImages[0].getAttribute('src')).toBe('/salad.webp');
        expect(proxyImages[1].getAttribute('src')).toBe('/steak.webp');

        // Check candidate 2 info
        expect(screen.getByText('Beef Steak')).toBeDefined();
        expect(screen.getByText('Chef Brown')).toBeDefined();
    });

    it('correctly maps navigation links to /recipes/ instead of /recipe/', () => {
        render(
            <TopRecipeVoting
                category="week"
                session={mockSession}
                userVote={null}
                mutate={mockMutate}
            />
        );

        const links = screen.getAllByTestId('mock-link');
        const hrefs = links.map((link) => link.getAttribute('href'));

        // All navigation links to recipes must use the new /recipes/ prefix
        expect(hrefs).toContain('/recipes/recipe-1');
        expect(hrefs).toContain('/recipes/recipe-2');
        expect(hrefs).not.toContain('/recipe/recipe-1');
        expect(hrefs).not.toContain('/recipe/recipe-2');
    });

    it('displays correctly when user has already voted for a candidate', () => {
        render(
            <TopRecipeVoting
                category="week"
                session={mockSession}
                userVote={{ recipeId: 'recipe-1' }}
                mutate={mockMutate}
            />
        );

        // Find Voted button indicator
        expect(screen.getByText('voted')).toBeDefined();
    });

    it('handles casting a vote successfully', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () =>
                Promise.resolve({ success: true, vote: { id: 'vote-1' } }),
        });
        global.fetch = fetchMock;

        render(
            <TopRecipeVoting
                category="week"
                session={mockSession}
                userVote={null}
                mutate={mockMutate}
            />
        );

        // Click the vote button for recipe-2 (labeled 'vote_now' via translation mock)
        const voteButtons = screen.getAllByText('vote_now');
        await fireEvent.click(voteButtons[1]); // Click vote for recipe-2

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/top-recipe-vote',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    sessionId: 'session-123',
                    recipeId: 'recipe-2',
                }),
            })
        );
    });

    it('handles undoing/cancelling a vote successfully', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, vote: null }),
        });
        global.fetch = fetchMock;

        render(
            <TopRecipeVoting
                category="week"
                session={mockSession}
                userVote={{ recipeId: 'recipe-1' }}
                mutate={mockMutate}
            />
        );

        // Click the 'voted' button for recipe-1 to undo the vote
        const votedButton = screen.getByText('voted');
        await fireEvent.click(votedButton);

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/top-recipe-vote',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    sessionId: 'session-123',
                    recipeId: 'recipe-1',
                }),
            })
        );
    });
});

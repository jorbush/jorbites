import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TopJorbitersClient from '@/app/top-jorbiters/TopJorbitersClient';
import { SafeUser } from '@/app/types';

// Mock dependencies
vi.mock('i18next', () => ({
    t: (key: string) => key,
}));

vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: () => ({
        onOpen: vi.fn(),
    }),
}));

vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

vi.mock('@/app/components/top-jorbiters/LeaderboardHeader', () => ({
    default: () => <div data-testid="leaderboard-header">Header Mock</div>,
}));

vi.mock('@/app/components/top-jorbiters/JorbiterCard', () => ({
    default: ({ jorbiter, index }: { jorbiter: SafeUser; index: number }) => (
        <div
            data-testid={`jorbiter-card-${index}`}
            data-id={jorbiter.id}
        >
            {jorbiter.name || 'Unknown User'}
        </div>
    ),
}));

vi.mock('@/app/components/utils/CallToAction', () => ({
    default: ({
        icon,
        title,
        subtitle,
        buttonText,
        onClick,
    }: {
        icon?: React.ReactNode;
        title: string;
        subtitle: string;
        buttonText: string;
        onClick: () => void;
    }) => (
        <div
            data-testid="call-to-action"
            data-icon={icon}
            data-title={title}
            data-subtitle={subtitle}
            data-button-text={buttonText}
            onClick={onClick}
        >
            Call To Action Mock
        </div>
    ),
}));

describe('<TopJorbitersClient />', () => {
    const mockCurrentUser: any = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
    };

    const mockTopJorbiters: any[] = [
        { id: 'user2', name: 'Top User', email: 'top@example.com' },
        { id: 'user1', name: 'John Doe', email: 'john@example.com' },
        { id: 'user3', name: 'Another User', email: 'another@example.com' },
    ];

    afterEach(() => {
        cleanup();
    });

    it('renders container component', () => {
        render(
            <TopJorbitersClient
                currentUser={mockCurrentUser}
                topJorbiters={mockTopJorbiters}
            />
        );
        expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('renders header component', () => {
        render(
            <TopJorbitersClient
                currentUser={mockCurrentUser}
                topJorbiters={mockTopJorbiters}
            />
        );
        expect(screen.getByTestId('leaderboard-header')).toBeInTheDocument();
    });

    it('renders jorbiter cards for each top jorbiter', () => {
        render(
            <TopJorbitersClient
                currentUser={mockCurrentUser}
                topJorbiters={mockTopJorbiters}
            />
        );

        expect(screen.getByTestId('jorbiter-card-0')).toBeInTheDocument();
        expect(screen.getByTestId('jorbiter-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('jorbiter-card-2')).toBeInTheDocument();

        expect(
            screen.getByTestId('jorbiter-card-0').getAttribute('data-id')
        ).toBe('user2');
        expect(
            screen.getByTestId('jorbiter-card-1').getAttribute('data-id')
        ).toBe('user1');
        expect(
            screen.getByTestId('jorbiter-card-2').getAttribute('data-id')
        ).toBe('user3');
    });

    it('renders call to action component with correct props', () => {
        render(
            <TopJorbitersClient
                currentUser={mockCurrentUser}
                topJorbiters={mockTopJorbiters}
            />
        );

        const callToAction = screen.getByTestId('call-to-action');
        expect(callToAction).toBeInTheDocument();
        expect(callToAction.getAttribute('data-icon')).toBe('🚀');
        expect(callToAction.getAttribute('data-title')).toBe(
            'call_to_action_first_place_title'
        );
        expect(callToAction.getAttribute('data-subtitle')).toBe(
            'call_to_action_first_place_subtitle'
        );
        expect(callToAction.getAttribute('data-button-text')).toBe(
            'post_recipe'
        );
    });

    it('handles missing top jorbiters', () => {
        render(<TopJorbitersClient currentUser={mockCurrentUser} />);

        // Should not throw error when topJorbiters is undefined
        expect(screen.queryByTestId('jorbiter-card-0')).toBeNull();
        const callToAction = screen.getByTestId('call-to-action');
        expect(callToAction).toBeInTheDocument();
        expect(callToAction.getAttribute('data-icon')).toBe('🏆');
        expect(callToAction.getAttribute('data-title')).toBe(
            'call_to_action_ranked_title'
        );
        expect(callToAction.getAttribute('data-subtitle')).toBe(
            'call_to_action_ranked_subtitle'
        );
        expect(callToAction.getAttribute('data-button-text')).toBe(
            'post_recipe'
        );
    });
});

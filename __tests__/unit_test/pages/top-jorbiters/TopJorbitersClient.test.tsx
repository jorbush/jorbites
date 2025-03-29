import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import TopJorbitersClient from '@/app/top-jorbiters/TopJorbitersClient';
import { SafeUser } from '@/app/types';

// Mock dependencies
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

vi.mock('@/app/components/top-jorbiters/CallToAction', () => ({
    default: ({
        currentUser,
    }: {
        currentUser?: SafeUser | null;
        topJorbiters?: SafeUser[];
    }) => (
        <div
            data-testid="call-to-action"
            data-user-id={currentUser?.id}
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
        render(<TopJorbitersClient />);
        expect(screen.getByTestId('container')).toBeDefined();
    });

    it('renders header component', () => {
        render(<TopJorbitersClient />);
        expect(screen.getByTestId('leaderboard-header')).toBeDefined();
    });

    it('renders jorbiter cards for each top jorbiter', () => {
        render(
            <TopJorbitersClient
                currentUser={mockCurrentUser}
                topJorbiters={mockTopJorbiters}
            />
        );

        expect(screen.getByTestId('jorbiter-card-0')).toBeDefined();
        expect(screen.getByTestId('jorbiter-card-1')).toBeDefined();
        expect(screen.getByTestId('jorbiter-card-2')).toBeDefined();

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

        expect(screen.getByTestId('call-to-action')).toBeDefined();
        expect(
            screen.getByTestId('call-to-action').getAttribute('data-user-id')
        ).toBe('user1');
    });

    it('handles missing top jorbiters', () => {
        render(<TopJorbitersClient currentUser={mockCurrentUser} />);

        // Should not throw error when topJorbiters is undefined
        expect(screen.queryByTestId('jorbiter-card-0')).toBeNull();
        expect(screen.getByTestId('call-to-action')).toBeDefined();
    });
});

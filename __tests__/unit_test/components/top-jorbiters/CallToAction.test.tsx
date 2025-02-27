import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CallToAction from '@/app/components/top-jorbiters/CallToAction';

// Mock dependencies
vi.mock('i18next', () => ({
    t: (key: string) => key,
}));

vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: () => ({
        onOpen: vi.fn(),
    }),
}));

vi.mock('@/app/components/top-jorbiters/ActionCard', () => ({
    default: ({ title, subtitle, buttonText, onClick, extraClasses }: any) => (
        <div
            data-testid="action-card"
            data-title={title}
            data-subtitle={subtitle}
            data-button={buttonText}
            data-classes={extraClasses || ''}
        >
            <button onClick={onClick}>Mock Button</button>
        </div>
    ),
}));

describe('<CallToAction />', () => {
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

    it('returns null when no current user', () => {
        const { container } = render(
            <CallToAction
                currentUser={null}
                topJorbiters={mockTopJorbiters}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders call to action for ranked user who is not first', () => {
        render(
            <CallToAction
                currentUser={mockCurrentUser}
                topJorbiters={mockTopJorbiters}
            />
        );

        const actionCard = screen.getByTestId('action-card');
        expect(actionCard).toBeDefined();
        expect(actionCard.getAttribute('data-title')).toBe(
            'call_to_action_first_place_title'
        );
        expect(actionCard.getAttribute('data-subtitle')).toBe(
            'call_to_action_first_place_subtitle'
        );
    });

    it('returns null for user in first place', () => {
        const firstPlaceUser = { ...mockCurrentUser, id: 'user2' };

        const { container } = render(
            <CallToAction
                currentUser={firstPlaceUser}
                topJorbiters={mockTopJorbiters}
            />
        );

        expect(container.firstChild).toBeNull();
    });
});

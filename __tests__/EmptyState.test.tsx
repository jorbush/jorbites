import {
    render,
    screen,
    fireEvent,
    cleanup,
} from '@testing-library/react';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
} from 'vitest';
import EmptyState from '../app/components/EmptyState';
import React from 'react';

const pushMock = vi.fn();

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

describe('<EmptyState />', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders with default props', () => {
        render(<EmptyState />);

        expect(
            screen.getByText('No exact matches')
        ).toBeDefined();
        expect(
            screen.getByText(
                'Try changing or removing some of your filters.'
            )
        ).toBeDefined();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders with custom title and subtitle', () => {
        const customTitle = 'Custom Title';
        const customSubtitle = 'Custom Subtitle';

        render(
            <EmptyState
                title={customTitle}
                subtitle={customSubtitle}
            />
        );

        expect(screen.getByText(customTitle)).toBeDefined();
        expect(
            screen.getByText(customSubtitle)
        ).toBeDefined();
    });

    it('renders reset button when showReset is true', () => {
        render(<EmptyState showReset={true} />);

        const resetButton = screen.getByRole('button', {
            name: 'Remove all filters',
        });
        expect(resetButton).toBeDefined();
    });

    it('calls router.push when reset button is clicked', () => {
        render(<EmptyState showReset={true} />);

        const resetButton = screen.getByRole('button', {
            name: 'Remove all filters',
        });
        fireEvent.click(resetButton);

        expect(pushMock).toHaveBeenCalledWith('/');
        expect(pushMock).toHaveBeenCalledTimes(1);
    });

    it('does not render reset button when showReset is false', () => {
        render(<EmptyState showReset={false} />);

        expect(screen.queryByRole('button')).toBeNull();
    });
});

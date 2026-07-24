import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import BiteCardsEmptyState from '@/app/components/recipes/BiteCardsEmptyState';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<BiteCardsEmptyState />', () => {
    const defaultProps = {
        onDiscoverNew: vi.fn(),
    };

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders empty state content and discover button', () => {
        render(<BiteCardsEmptyState {...defaultProps} />);

        expect(screen.getByTestId('bite-cards-empty-state')).toBeDefined();
        expect(screen.getByText('bite_cards_all_caught_up')).toBeDefined();
        expect(screen.getByText('bite_cards_all_caught_up_desc')).toBeDefined();
        expect(screen.getByTestId('bite-cards-discover-btn')).toBeDefined();
    });

    it('triggers onDiscoverNew when discover button is clicked', () => {
        render(<BiteCardsEmptyState {...defaultProps} />);

        fireEvent.click(screen.getByTestId('bite-cards-discover-btn'));
        expect(defaultProps.onDiscoverNew).toHaveBeenCalledTimes(1);
    });
});

import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import BiteCardsControls from '@/app/components/recipes/BiteCardsControls';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<BiteCardsControls />', () => {
    const defaultProps = {
        canUndo: true,
        onUndo: vi.fn(),
        onSkip: vi.fn(),
        onView: vi.fn(),
        onFavorite: vi.fn(),
    };

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders all 4 control buttons', () => {
        render(<BiteCardsControls {...defaultProps} />);

        expect(screen.getByTestId('bite-cards-controls')).toBeDefined();
        expect(screen.getByTestId('bite-cards-undo-btn')).toBeDefined();
        expect(screen.getByTestId('bite-cards-skip-btn')).toBeDefined();
        expect(screen.getByTestId('bite-cards-view-btn')).toBeDefined();
        expect(screen.getByTestId('bite-cards-favorite-btn')).toBeDefined();
    });

    it('triggers click handlers when buttons are pressed', () => {
        render(<BiteCardsControls {...defaultProps} />);

        fireEvent.click(screen.getByTestId('bite-cards-undo-btn'));
        expect(defaultProps.onUndo).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('bite-cards-skip-btn'));
        expect(defaultProps.onSkip).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('bite-cards-view-btn'));
        expect(defaultProps.onView).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('bite-cards-favorite-btn'));
        expect(defaultProps.onFavorite).toHaveBeenCalledTimes(1);
    });

    it('disables undo button when canUndo is false', () => {
        render(
            <BiteCardsControls
                {...defaultProps}
                canUndo={false}
            />
        );

        const undoBtn = screen.getByTestId(
            'bite-cards-undo-btn'
        ) as HTMLButtonElement;
        expect(undoBtn.disabled).toBe(true);
    });
});

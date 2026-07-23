import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import BiteCardsHeader from '@/app/components/recipes/BiteCardsHeader';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<BiteCardsHeader />', () => {
    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders header title', () => {
        render(
            <BiteCardsHeader
                currentIndex={0}
                totalRecipes={5}
            />
        );

        expect(screen.getByTestId('bite-cards-header')).toBeDefined();
        expect(screen.getByText('bite_cards_title')).toBeDefined();
    });

    it('renders current progress counter when active cards exist', () => {
        render(
            <BiteCardsHeader
                currentIndex={2}
                totalRecipes={10}
            />
        );

        const counter = screen.getByTestId('bite-cards-counter');
        expect(counter).toBeDefined();
        expect(counter.textContent).toBe('3 / 10');
    });

    it('hides progress counter when all cards are swiped', () => {
        render(
            <BiteCardsHeader
                currentIndex={5}
                totalRecipes={5}
            />
        );

        expect(screen.queryByTestId('bite-cards-counter')).toBeNull();
    });
});

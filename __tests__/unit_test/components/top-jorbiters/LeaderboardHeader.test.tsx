import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import LeaderboardHeader from '@/app/components/top-jorbiters/LeaderboardHeader';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'top_jorbiters_description') {
                return 'Los chefs más destacados de nuestra comunidad. ¡Sube recetas para aumentar tu nivel y únete a la élite!';
            }
            return key;
        },
    }),
}));

describe('<LeaderboardHeader />', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders the header title', () => {
        render(<LeaderboardHeader />);
        expect(screen.getByText('Top Jorbiters 👨‍🍳')).toBeDefined();
    });

    it('renders the translated description', () => {
        render(<LeaderboardHeader />);
        // Check for the translated text
        const expectedText =
            'Los chefs más destacados de nuestra comunidad. ¡Sube recetas para aumentar tu nivel y únete a la élite!';
        expect(screen.getByText(expectedText)).toBeDefined();
    });

    it('applies correct styling classes', () => {
        render(<LeaderboardHeader />);
        const heading = screen.getByText('Top Jorbiters 👨‍🍳');
        expect(heading.tagName).toBe('H1');
        expect(heading.className).toContain('text-3xl');
        expect(heading.className).toContain('font-bold');
    });
});

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import BiteCardGestureBadges from '@/app/components/recipes/BiteCardGestureBadges';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<BiteCardGestureBadges />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders save, skip, and view badges with correct opacities', () => {
        render(
            <BiteCardGestureBadges
                rightOpacity={0.8}
                leftOpacity={0.2}
                upOpacity={0.5}
            />
        );

        const saveBadge = screen.getByText('bite_cards_save').closest('div');
        const skipBadge = screen.getByText('bite_cards_skip').closest('div');
        const viewBadge = screen.getByText('bite_cards_view').closest('div');

        expect(saveBadge?.style.opacity).toBe('0.8');
        expect(skipBadge?.style.opacity).toBe('0.2');
        expect(viewBadge?.style.opacity).toBe('0.5');
    });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CookedBadge from '@/app/components/comments/CookedBadge';

let mockIsMounted = true;
vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => mockIsMounted,
}));

let mockTranslation: Record<string, string> = {
    cooked_short: 'Cooked',
};

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => mockTranslation[key] || key,
    }),
}));

describe('CookedBadge', () => {
    beforeEach(() => {
        mockIsMounted = true;
        mockTranslation = { cooked_short: 'Cooked' };
    });

    it('renders cooked badge with avocado icon and translation', () => {
        render(<CookedBadge />);
        const badge = screen.getByTestId('cooked-badge');
        expect(badge).toBeDefined();
        expect(badge.getAttribute('data-cy')).toBe('cooked-badge');
        expect(badge.textContent).toContain('🥑 Cooked');
    });

    it('falls back to Cooked when translation key returns itself or is unmounted', () => {
        mockTranslation = {};
        render(<CookedBadge />);
        expect(screen.getByTestId('cooked-badge').textContent).toContain(
            '🥑 Cooked'
        );

        mockIsMounted = false;
        render(<CookedBadge />);
        expect(screen.getAllByTestId('cooked-badge')[1].textContent).toContain(
            '🥑 Cooked'
        );
    });

    it('applies custom className', () => {
        render(<CookedBadge className="custom-class" />);
        expect(screen.getByTestId('cooked-badge').className).toContain(
            'custom-class'
        );
    });
});

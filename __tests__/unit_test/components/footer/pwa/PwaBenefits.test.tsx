import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PwaBenefits from '@/app/components/footer/pwa/PwaBenefits';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('PwaBenefits', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders all three benefit items', () => {
        render(<PwaBenefits />);

        expect(screen.getByText('footer_pwa_benefit_standalone')).toBeDefined();
        expect(screen.getByText('footer_pwa_benefit_offline')).toBeDefined();
        expect(
            screen.getByText('footer_pwa_benefit_notifications')
        ).toBeDefined();
    });
});

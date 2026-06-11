import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeCoCooks } from '@/app/components/recipes/RecipeCoCooks';

// mock components
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ onClick }: any) => (
        <div
            data-testid="avatar"
            onClick={onClick}
        />
    ),
}));
vi.mock('@/app/components/VerificationBadge', () => ({
    default: () => <span data-testid="verification-badge" />,
}));
vi.mock('@/app/utils/responsive', () => ({
    default: (user: any) => user.name,
}));

describe('RecipeCoCooks', () => {
    const t = (key: string) => key;
    const push = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders loading skeleton when loading', () => {
        render(
            <RecipeCoCooks
                isLoadingRelatedData={true}
                coCooks={[]}
                mounted={true}
                t={t}
                push={push}
            />
        );
        expect(screen.getByText('co_cooks')).toBeDefined();
    });

    it('renders cooks list when data loaded', () => {
        const coCooks = [
            {
                id: 'cook-1',
                name: 'Chef A',
                image: 'a.jpg',
                verified: false,
            },
        ];
        render(
            <RecipeCoCooks
                isLoadingRelatedData={false}
                coCooks={coCooks}
                mounted={true}
                t={t}
                push={push}
            />
        );
        expect(screen.getByText('Chef A')).toBeDefined();
    });
});

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import CookiesPolicyPage from '@/app/policies/cookies/page';
import * as policyUtils from '@/app/utils/policy-utils';

vi.mock('next/headers', () => ({
    cookies: () => ({
        get: vi.fn(),
    }),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: vi.fn(),
    }),
}));

vi.mock('@/app/utils/policy-utils', () => ({
    getPolicyBySlug: vi.fn(),
}));

const mockPolicy = {
    frontmatter: {
        title: 'Cookies Policy',
        description: 'Jorbites Cookies Policy',
    },
    content: `
This is a mock cookies policy.
    `,
    slug: 'cookies',
    language: 'en',
};

describe('CookiesPolicyPage', () => {
    beforeEach(() => {
        vi.spyOn(policyUtils, 'getPolicyBySlug').mockResolvedValue(mockPolicy);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders CookiesPolicy', async () => {
        const Page = await CookiesPolicyPage();
        render(Page);
        expect(screen.getByText('Cookies Policy')).toBeDefined();
        expect(
            screen.getByText('This is a mock cookies policy.')
        ).toBeDefined();
    });
});

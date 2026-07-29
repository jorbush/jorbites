import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import TermsPolicyPage from '@/app/policies/terms/page';
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
    getPoliciesBySlug: vi.fn(),
}));

const mockPolicy = {
    frontmatter: {
        title: 'Terms of Service',
        description: 'Jorbites Terms of Service',
    },
    content: `
This is a mock terms of service policy.
    `,
    slug: 'terms',
    language: 'en',
};

const mockPolicies = {
    en: mockPolicy,
    es: mockPolicy,
    ca: mockPolicy,
};

describe('TermsPolicyPage', () => {
    beforeEach(() => {
        vi.spyOn(policyUtils, 'getPolicyBySlug').mockResolvedValue(mockPolicy);
        vi.spyOn(policyUtils, 'getPoliciesBySlug').mockResolvedValue(
            mockPolicies
        );
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders TermsPolicy', async () => {
        const Page = await TermsPolicyPage();
        render(Page);
        expect(screen.getByText('Terms of Service')).toBeDefined();
        expect(
            screen.getByText('This is a mock terms of service policy.')
        ).toBeDefined();
    });
});

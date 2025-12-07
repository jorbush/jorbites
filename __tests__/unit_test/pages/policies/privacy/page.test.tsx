import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import PrivacyPolicyPage from '@/app/policies/privacy/page';
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
        title: 'Privacy Policy',
        description: 'Jorbites Privacy Policy',
    },
    content: `
This is a mock privacy policy.
    `,
    slug: 'privacy',
    language: 'en',
};

describe('PrivacyPolicyPage', () => {
    beforeEach(() => {
        vi.spyOn(policyUtils, 'getPolicyBySlug').mockResolvedValue(mockPolicy);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders PrivacyPolicy', async () => {
        const Page = await PrivacyPolicyPage();
        render(Page);
        expect(screen.getByText('Privacy Policy')).toBeDefined();
        expect(screen.getByText('This is a mock privacy policy.')).toBeDefined();
    });
});

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import CookiesPolicy from '@/app/policies/cookies/cookies';
import * as policyUtils from '@/app/utils/policy-utils';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: vi.fn(),
    }),
}));

// Mock the react-i18next module
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockPolicy = {
    frontmatter: {
        title: 'Cookies Policy',
        description: 'Jorbites Cookies Policy',
    },
    content: `
This is a mock cookies policy.

## What are cookies?
Mock definition of cookies.

### Third-party services
- [Google SSO](https://policies.google.com/privacy)
- [GitHub SSO](https://docs.github.com/en/github/authenticating-to-github/githubs-privacy-statement)
- [Vercel](https://vercel.com)
- [Hostinger](https://www.hostinger.com)
- [MongoDB](https://www.mongodb.com)
- [Cloudinary](https://cloudinary.com/)

### Privacy Policies
- [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)
- [Hostinger Privacy Policy](https://www.hostinger.com/privacy)
- [MongoDB Privacy Policy](https://www.mongodb.com/legal/privacy-policy)
- [Cloudinary Privacy Policy](https://cloudinary.com/privacy)

### Contact
Contact us at [jbonetv5@gmail.com](mailto:jbonetv5@gmail.com).

Read our [Privacy Policy](/policies/privacy).
    `,
    slug: 'cookies',
    language: 'en',
};

describe('CookiesPolicy', () => {
    beforeEach(() => {
        vi.spyOn(policyUtils, 'getPolicyBySlug').mockResolvedValue(mockPolicy);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders the cookies policy content', async () => {
        render(<CookiesPolicy />);
        expect(await screen.findByText('Cookies Policy')).toBeDefined();
        expect(await screen.findByText('What are cookies?')).toBeDefined();
        expect(await screen.findByText('Third-party services')).toBeDefined();
        expect(await screen.findByText('Contact')).toBeDefined();
    });

    it('has a back button that calls router.back()', async () => {
        render(<CookiesPolicy />);
        const backButton = await screen.findByRole('button');
        expect(backButton).toBeDefined();
    });

    it('contains links to external services', async () => {
        render(<CookiesPolicy />);

        expect(await screen.findByText('Google SSO')).toBeDefined();
        expect(await screen.findByText('GitHub SSO')).toBeDefined();
        expect(await screen.findByText('Vercel')).toBeDefined();
        expect(await screen.findByText('Hostinger')).toBeDefined();
        expect(await screen.findByText('MongoDB')).toBeDefined();
        expect(await screen.findByText('Cloudinary')).toBeDefined();
    });

    it('contains links to privacy policies', async () => {
        render(<CookiesPolicy />);
        expect(await screen.findByText('Vercel Privacy Policy')).toBeDefined();
        expect(await screen.findByText('Hostinger Privacy Policy')).toBeDefined();
        expect(await screen.findByText('MongoDB Privacy Policy')).toBeDefined();
        expect(await screen.findByText('Cloudinary Privacy Policy')).toBeDefined();
    });

    it('contains email contact information', async () => {
        render(<CookiesPolicy />);
        const emailLink = await screen.findByText('jbonetv5@gmail.com');
        expect(emailLink).toBeDefined();
        expect(emailLink.getAttribute('href')).toBe('mailto:jbonetv5@gmail.com');
    });

    it('contains a link to the privacy policy', async () => {
        render(<CookiesPolicy />);
        const privacyPolicyLink = await screen.findByText('Privacy Policy');
        expect(privacyPolicyLink).toBeDefined();
        expect(privacyPolicyLink.getAttribute('href')).toBe('/policies/privacy');
    });
});

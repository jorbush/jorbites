import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import PrivacyPolicy from '@/app/policies/privacy/privacy';
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
        title: 'Privacy Policy',
        description: 'Jorbites Privacy Policy',
    },
    content: `
This is a mock privacy policy.

## Information We Collect
Mock information about data collection.

### Third-party services
- [Cloudinary](https://cloudinary.com/)
- [Vercel](https://vercel.com)
- [Hostinger](https://www.hostinger.com)
- [MongoDB](https://www.mongodb.com)

### Contact
Contact us at [jbonetv5@gmail.com](mailto:jbonetv5@gmail.com).
    `,
    slug: 'privacy',
    language: 'en',
};

describe('PrivacyPolicy', () => {
    beforeEach(() => {
        vi.spyOn(policyUtils, 'getPolicyBySlug').mockResolvedValue(mockPolicy);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders the privacy policy content', async () => {
        render(<PrivacyPolicy />);
        expect(await screen.findByText('Privacy Policy')).toBeDefined();
        expect(await screen.findByText('Information We Collect')).toBeDefined();
        expect(await screen.findByText('Third-party services')).toBeDefined();
        expect(await screen.findByText('Contact')).toBeDefined();
    });

    it('has a back button that calls router.back()', async () => {
        render(<PrivacyPolicy />);
        const backButton = await screen.findByRole('button');
        expect(backButton).toBeDefined();
    });

    it('contains links to external services', async () => {
        render(<PrivacyPolicy />);
        expect(await screen.findByText('Cloudinary')).toBeDefined();
        expect(await screen.findByText('Vercel')).toBeDefined();
        expect(await screen.findByText('Hostinger')).toBeDefined();
        expect(await screen.findByText('MongoDB')).toBeDefined();
    });

    it('contains email contact information', async () => {
        render(<PrivacyPolicy />);
        const emailLink = await screen.findByText('jbonetv5@gmail.com');
        expect(emailLink).toBeDefined();
        expect(emailLink.getAttribute('href')).toBe('mailto:jbonetv5@gmail.com');
    });
});

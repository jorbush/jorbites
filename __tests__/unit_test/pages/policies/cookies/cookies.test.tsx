import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import CookiesPolicy from '@/app/policies/cookies/cookies';

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

describe('CookiesPolicy', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the cookies policy content', () => {
        const { getByText } = render(<CookiesPolicy />);

        expect(getByText('cookies_policy')).toBeDefined();
        expect(getByText('what_are_cookies')).toBeDefined();
        expect(getByText('types_of_cookies')).toBeDefined();
        expect(getByText('essential_technical_cookies')).toBeDefined();
        expect(getByText('third_party_services')).toBeDefined();
        expect(getByText('how_to_manage_cookies')).toBeDefined();
        expect(getByText('changes_in_cookies_policy')).toBeDefined();
        expect(getByText('contact')).toBeDefined();
    });

    it('has a back button that calls router.back()', () => {
        const { getByRole } = render(<CookiesPolicy />);

        const backButton = getByRole('button');
        expect(backButton).toBeDefined();
    });

    it('contains links to external services', () => {
        const { getByText } = render(<CookiesPolicy />);

        expect(getByText('Google SSO')).toBeDefined();
        expect(getByText('GitHub SSO')).toBeDefined();
        expect(getByText('Vercel')).toBeDefined();
        expect(getByText('GoDaddy')).toBeDefined();
        expect(getByText('MongoDB')).toBeDefined();
        expect(getByText('Cloudinary')).toBeDefined();
    });

    it('contains links to privacy policies', () => {
        const { getByText } = render(<CookiesPolicy />);

        expect(getByText('vercel_privacy_policy')).toBeDefined();
        expect(getByText('godaddy_privacy_policy')).toBeDefined();
        expect(getByText('mongodb_privacy_policy')).toBeDefined();
        expect(getByText('cloudinary_privacy_policy')).toBeDefined();
    });

    it('contains email contact information', () => {
        const { getByText } = render(<CookiesPolicy />);

        const emailLink = getByText('jbonetv5@gmail.com');
        expect(emailLink).toBeDefined();
        expect(emailLink.getAttribute('href')).toBe(
            'mailto:jbonetv5@gmail.com'
        );
    });

    it('contains a link to the privacy policy', () => {
        const { getByText } = render(<CookiesPolicy />);

        const privacyPolicyLink = getByText('privacy_policy');
        expect(privacyPolicyLink).toBeDefined();
        expect(privacyPolicyLink.getAttribute('href')).toBe(
            '/policies/privacy'
        );
    });
});

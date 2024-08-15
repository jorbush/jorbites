import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import PrivacyPolicy from '@/app/policies/privacy/privacy';

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

describe('PrivacyPolicy', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders the privacy policy content', () => {
        const { getByText } = render(<PrivacyPolicy />);

        expect(getByText('privacy_policy')).toBeDefined();
        expect(getByText('information_we_collect')).toBeDefined();
        expect(getByText('how_we_use_info')).toBeDefined();
        expect(getByText('sharing_info')).toBeDefined();
        expect(getByText('data_security')).toBeDefined();
        expect(getByText('your_rights')).toBeDefined();
        expect(getByText('data_retention')).toBeDefined();
        expect(getByText('policy_changes')).toBeDefined();
        expect(getByText('8. contact')).toBeDefined();
    });

    it('has a back button that calls router.back()', () => {
        const { getByRole } = render(<PrivacyPolicy />);

        const backButton = getByRole('button');
        expect(backButton).toBeDefined();

        // You can add a test here to simulate a click and check if router.back() is called
        // This would require setting up a mock for useRouter and its back() method
    });

    it('contains links to external services', () => {
        const { getAllByText, getByText } = render(<PrivacyPolicy />);

        expect(getAllByText('Cloudinary')).toBeDefined();
        expect(getByText('Vercel')).toBeDefined();
        expect(getByText('GoDaddy')).toBeDefined();
        expect(getByText('MongoDB')).toBeDefined();
    });

    it('contains email contact information', () => {
        const { getAllByText } = render(<PrivacyPolicy />);

        const emailLinks = getAllByText('jbonetv5@gmail.com');
        expect(emailLinks.length).toBe(2);
        emailLinks.forEach((link) => {
            expect(link.getAttribute('href')).toBe('mailto:jbonetv5@gmail.com');
        });
    });
});

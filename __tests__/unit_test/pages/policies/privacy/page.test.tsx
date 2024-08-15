import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import PrivacyPolicyPage from '@/app/policies/privacy/page';

// Mock the ClientOnly component
vi.mock('@/app/components/ClientOnly', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="client-only">{children}</div>
    ),
}));

// Mock the PrivacyPolicy component
vi.mock('@/app/policies/privacy/privacy', () => ({
    default: () => (
        <div data-testid="privacy-policy">Mocked Privacy Policy</div>
    ),
}));

describe('PrivacyPolicyPage', () => {
    it('renders PrivacyPolicy wrapped in ClientOnly', () => {
        const { getByTestId } = render(<PrivacyPolicyPage />);

        const clientOnlyWrapper = getByTestId('client-only');
        expect(clientOnlyWrapper).toBeDefined();

        const privacyPolicyComponent = getByTestId('privacy-policy');
        expect(privacyPolicyComponent).toBeDefined();
    });
});

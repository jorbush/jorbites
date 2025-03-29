import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CookiesPolicyPage from '@/app/policies/cookies/page';

// Mock the ClientOnly component
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="client-only">{children}</div>
    ),
}));

vi.mock('@/app/components/utils/ClientOnly', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="client-only">{children}</div>
    ),
}));

// Mock the CookiesPolicy component
vi.mock('@/app/policies/cookies/cookies', () => ({
    default: () => (
        <div data-testid="cookies-policy">Mocked Cookies Policy</div>
    ),
}));

describe('CookiesPolicyPage', () => {
    it('renders CookiesPolicy wrapped in ClientOnly', () => {
        const { getByTestId } = render(<CookiesPolicyPage />);

        const clientOnlyWrapper = getByTestId('client-only');
        expect(clientOnlyWrapper).toBeDefined();

        const cookiesPolicyComponent = getByTestId('cookies-policy');
        expect(cookiesPolicyComponent).toBeDefined();
    });
});

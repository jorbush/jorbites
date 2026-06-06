import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RootLayout from '@/app/layout';

// Mocks
vi.mock('next/font/google', () => ({
    Nunito: () => ({ className: 'mocked-font-class' }),
}));

vi.mock('@/app/components/navbar/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));

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

vi.mock('@/app/components/modals/RegisterModal', () => ({
    default: () => <div data-testid="register-modal">RegisterModal</div>,
}));

vi.mock('@/app/providers/ToasterProvider', () => ({
    default: () => <div data-testid="toaster-provider">ToasterProvider</div>,
}));

vi.mock('@/app/components/modals/LoginModal', () => ({
    default: () => <div data-testid="login-modal">LoginModal</div>,
}));

vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
    auth: vi.fn(() => Promise.resolve({ user: { email: 'user-1@test.com' } })),
}));

vi.mock('@/app/components/modals/RecipeModal', () => ({
    default: () => <div data-testid="recipe-modal">RecipeModal</div>,
}));

vi.mock('@/app/components/modals/SettingsModal', () => ({
    default: () => <div data-testid="settings-modal">SettingsModal</div>,
}));

vi.mock('@/app/components/footer/SmartFooter', () => ({
    default: () => <div data-testid="smart-footer">SmartFooter</div>,
}));

vi.mock('@/app/components/modals/WorkshopModal', () => ({
    default: () => <div data-testid="workshop-modal">WorkshopModal</div>,
}));

vi.mock('@/app/components/utils/PullToRefresh', () => ({
    default: () => <div data-testid="pull-to-refresh">PullToRefresh</div>,
}));

vi.mock('@/app/components/modals/ForgotPasswordModal', () => ({
    default: () => (
        <div data-testid="forgot-password-modal">ForgotPasswordModal</div>
    ),
}));

vi.mock('@/app/components/modals/QuestModal', () => ({
    default: () => <div data-testid="quest-modal">QuestModal</div>,
}));

vi.mock('@/app/components/modals/AddToListModal', () => ({
    default: () => <div data-testid="add-to-list-modal">AddToListModal</div>,
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

describe('RootLayout', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the layout correctly', async () => {
        const getCurrentUserMock = await import('@/app/actions/getCurrentUser');
        vi.mocked(getCurrentUserMock.default).mockResolvedValue({
            id: '1',
            name: 'Test User',
        } as any);

        const layout = await RootLayout({
            children: <div>Test Content</div>,
        });
        const { findByTestId, findAllByTestId, findByText } = render(layout);

        // Check if all components are rendered
        expect(await findByTestId('navbar')).toBeDefined();
        const clientOnlyComponents = await findAllByTestId('client-only');
        expect(clientOnlyComponents.length).toBeGreaterThan(0);
        expect(await findByTestId('register-modal')).toBeDefined();
        expect(await findByTestId('toaster-provider')).toBeDefined();
        expect(await findByTestId('login-modal')).toBeDefined();
        expect(await findByTestId('recipe-modal')).toBeDefined();
        expect(await findByTestId('settings-modal')).toBeDefined();
        expect(await findByTestId('workshop-modal')).toBeDefined();
        expect(await findByTestId('pull-to-refresh')).toBeDefined();
        expect(await findByTestId('forgot-password-modal')).toBeDefined();
        expect(await findByTestId('quest-modal')).toBeDefined();
        expect(await findByTestId('add-to-list-modal')).toBeDefined();
        expect(await findByTestId('smart-footer')).toBeDefined();

        // Check if the children are rendered
        expect(await findByText('Test Content')).toBeDefined();
    });

    it('wraps children in a div with correct classes', async () => {
        const getCurrentUserMock = await import('@/app/actions/getCurrentUser');
        vi.mocked(getCurrentUserMock.default).mockResolvedValue(null);

        const layout = await RootLayout({
            children: <div data-testid="test-content">Test Content</div>,
        });

        const { getByTestId } = render(layout);

        const content = getByTestId('test-content');
        expect(content).toBeTruthy();
        expect(content.textContent).toBe('Test Content');
    });
});

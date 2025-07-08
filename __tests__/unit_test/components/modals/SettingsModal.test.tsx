import React from 'react';
import {
    render,
    screen,
    cleanup,
    fireEvent,
    waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import SettingsModal from '@/app/components/modals/SettingsModal';
import useSettingsModal from '@/app/hooks/useSettingsModal';
import { SafeUser } from '@/app/types';

// Mock dependencies
vi.mock('@/app/hooks/useSettingsModal');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

vi.mock('@/app/components/settings/ThemeSelector', () => ({
    default: () => <div data-testid="theme-selector">ThemeSelector</div>,
}));

vi.mock('@/app/components/settings/LanguageSelector', () => ({
    default: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

vi.mock('@/app/components/settings/EmailNotificationsSelector', () => ({
    default: () => (
        <div data-testid="email-notifications-selector">
            EmailNotificationsSelector
        </div>
    ),
}));

vi.mock('@/app/components/settings/ChangeUserImage', () => ({
    default: () => (
        <div data-testid="change-user-image-selector">
            ChangeUserImageSelector
        </div>
    ),
}));

vi.mock('@/app/components/settings/ChangeUserName', () => ({
    default: () => (
        <div data-testid="change-user-name-selector">
            ChangeUserNameSelector
        </div>
    ),
}));

// Mock the Tabs component
vi.mock('@/app/components/utils/Tabs', () => ({
    default: ({ tabs, activeTab, onTabChange, ...props }: any) => (
        <div data-testid={props['data-testid']}>
            {tabs.map((tab: any) => (
                <button
                    key={tab.id}
                    data-testid={`tab-${tab.id}`}
                    onClick={() => onTabChange(tab.id)}
                    className={activeTab === tab.id ? 'active' : ''}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    ),
}));

const mockSettingsModalClose = vi.fn();

const mockUseSettingsModal = {
    isOpen: true,
    onClose: mockSettingsModalClose,
};

(useSettingsModal as any).mockReturnValue(mockUseSettingsModal);

describe('SettingsModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the settings modal with tabs', () => {
        render(<SettingsModal currentUser={null} />);

        expect(screen.getByTestId('modal-title')).toBeDefined();
        expect(screen.getByTestId('settings-tabs')).toBeDefined();
    });

    it('renders only preferences tab when no current user', () => {
        render(<SettingsModal currentUser={null} />);

        expect(screen.getByTestId('tab-preferences')).toBeDefined();
        expect(screen.getByText('preferences')).toBeDefined();

        // Account tab should not be present
        expect(screen.queryByTestId('tab-account')).toBeNull();
        expect(screen.queryByText('account')).toBeNull();
    });

    it('renders both preferences and account tabs when current user is provided', () => {
        const currentUser = {
            id: '1',
            name: 'Test User',
        } as SafeUser;

        render(<SettingsModal currentUser={currentUser} />);

        expect(screen.getByTestId('tab-preferences')).toBeDefined();
        expect(screen.getByText('preferences')).toBeDefined();
        expect(screen.getByTestId('tab-account')).toBeDefined();
        expect(screen.getByText('account')).toBeDefined();
    });

    it('shows preferences content by default', () => {
        render(<SettingsModal currentUser={null} />);

        expect(screen.getByTestId('theme-selector')).toBeDefined();
        expect(screen.getByTestId('language-selector')).toBeDefined();

        // Account settings should not be visible
        expect(screen.queryByTestId('change-user-name-selector')).toBeNull();
        expect(screen.queryByTestId('email-notifications-selector')).toBeNull();
        expect(screen.queryByTestId('change-user-image-selector')).toBeNull();
    });

    it('switches to account tab and shows account content', async () => {
        const currentUser = {
            id: '1',
            name: 'Test User',
        } as SafeUser;

        render(<SettingsModal currentUser={currentUser} />);

        // Initially shows preferences content
        expect(screen.getByTestId('theme-selector')).toBeDefined();
        expect(screen.getByTestId('language-selector')).toBeDefined();

        // Click account tab
        fireEvent.click(screen.getByTestId('tab-account'));

        await waitFor(() => {
            // Should now show account content
            expect(
                screen.getByTestId('change-user-name-selector')
            ).toBeDefined();
            expect(
                screen.getByTestId('email-notifications-selector')
            ).toBeDefined();
            expect(
                screen.getByTestId('change-user-image-selector')
            ).toBeDefined();

            // Preferences content should still be in DOM but not visible
            expect(screen.queryByTestId('theme-selector')).toBeNull();
            expect(screen.queryByTestId('language-selector')).toBeNull();
        });
    });

    it('switches back to preferences tab correctly', async () => {
        const currentUser = {
            id: '1',
            name: 'Test User',
        } as SafeUser;

        render(<SettingsModal currentUser={currentUser} />);

        // Switch to account tab
        fireEvent.click(screen.getByTestId('tab-account'));

        await waitFor(() => {
            expect(
                screen.getByTestId('change-user-name-selector')
            ).toBeDefined();
            expect(
                screen.getByTestId('email-notifications-selector')
            ).toBeDefined();
        });

        // Switch back to preferences tab
        fireEvent.click(screen.getByTestId('tab-preferences'));

        await waitFor(() => {
            // Should show preferences content again
            expect(screen.getByTestId('theme-selector')).toBeDefined();
            expect(screen.getByTestId('language-selector')).toBeDefined();

            // Account content should not be visible
            expect(
                screen.queryByTestId('change-user-name-selector')
            ).toBeNull();
            expect(
                screen.queryByTestId('email-notifications-selector')
            ).toBeNull();
            expect(
                screen.queryByTestId('change-user-image-selector')
            ).toBeNull();
        });
    });

    it('maintains preferences tab as active when no current user', () => {
        render(<SettingsModal currentUser={null} />);

        const preferencesTab = screen.getByTestId('tab-preferences');
        expect(preferencesTab.className).toContain('active');

        // Always shows preferences content when no user
        expect(screen.getByTestId('theme-selector')).toBeDefined();
        expect(screen.getByTestId('language-selector')).toBeDefined();
    });

    it('renders correct tab labels with icons', () => {
        const currentUser = {
            id: '1',
            name: 'Test User',
        } as SafeUser;

        render(<SettingsModal currentUser={currentUser} />);

        // Check that both tab labels are present
        expect(screen.getByText('preferences')).toBeDefined();
        expect(screen.getByText('account')).toBeDefined();
    });

    it('renders minimum height container for tab content', () => {
        render(<SettingsModal currentUser={null} />);

        // The content container should have min-height class
        const contentContainer = screen
            .getByTestId('theme-selector')
            .closest('.min-h-\\[200px\\]');
        expect(contentContainer).toBeTruthy();
    });
});

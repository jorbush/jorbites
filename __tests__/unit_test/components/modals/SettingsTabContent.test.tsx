import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SettingsTabContent from '@/app/components/modals/SettingsTabContent';
import { SafeUser } from '@/app/types';

// Mock dependencies
vi.mock('@/app/components/settings/ThemeSelector', () => ({
    default: () => <div data-testid="theme-selector">ThemeSelector</div>,
}));

vi.mock('@/app/components/settings/LanguageSelector', () => ({
    default: ({ currentUser }: any) => (
        <div data-testid="language-selector">
            LanguageSelector for {currentUser?.name || 'none'}
        </div>
    ),
}));

vi.mock('@/app/components/settings/EmailNotificationsSelector', () => ({
    default: ({ currentUser }: any) => (
        <div data-testid="email-notifications-selector">
            EmailNotificationsSelector for {currentUser?.name}
        </div>
    ),
}));

vi.mock('@/app/components/settings/PushNotificationManager', () => ({
    default: () => (
        <div data-testid="push-notification-manager">
            PushNotificationManager
        </div>
    ),
}));

vi.mock('@/app/components/settings/ChangeUserImage', () => ({
    default: ({ ref: _ref }: any) => (
        <div data-testid="change-user-image-selector">
            ChangeUserImageSelector
        </div>
    ),
}));

vi.mock('@/app/components/settings/ChangeUserName', () => ({
    default: ({ ref: _ref }: any) => (
        <div data-testid="change-user-name-selector">
            ChangeUserNameSelector
        </div>
    ),
}));

vi.mock('@/app/components/settings/ChangePassword', () => ({
    default: ({ ref: _ref }: any) => (
        <div data-testid="change-password-selector">ChangePassword</div>
    ),
}));

vi.mock('@/app/components/settings/DeleteAccount', () => ({
    default: () => (
        <div data-testid="delete-account-selector">DeleteAccount</div>
    ),
}));

describe('SettingsTabContent', () => {
    const mockUserImageRef = React.createRef<any>();
    const mockUserNameRef = React.createRef<any>();
    const mockPasswordRef = React.createRef<any>();

    const defaultProps = {
        activeTab: 'preferences',
        currentUser: null,
        userImageRef: mockUserImageRef,
        userNameRef: mockUserNameRef,
        passwordRef: mockPasswordRef,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders preferences content when activeTab is "preferences"', () => {
        render(<SettingsTabContent {...defaultProps} />);

        expect(screen.getByTestId('theme-selector')).toBeDefined();
        expect(screen.getByTestId('language-selector')).toBeDefined();
        expect(screen.getByText('LanguageSelector for none')).toBeDefined();

        expect(screen.queryByTestId('email-notifications-selector')).toBeNull();
        expect(screen.queryByTestId('push-notification-manager')).toBeNull();
    });

    it('renders account content when activeTab is "account" and currentUser is provided', () => {
        const currentUser = {
            id: '1',
            name: 'Test User',
        } as SafeUser;

        render(
            <SettingsTabContent
                {...defaultProps}
                activeTab="account"
                currentUser={currentUser}
            />
        );

        expect(
            screen.getByTestId('email-notifications-selector')
        ).toBeDefined();
        expect(
            screen.getByText('EmailNotificationsSelector for Test User')
        ).toBeDefined();
        expect(screen.getByTestId('push-notification-manager')).toBeDefined();
        expect(screen.getByTestId('change-user-image-selector')).toBeDefined();
        expect(screen.getByTestId('change-user-name-selector')).toBeDefined();
        expect(screen.getByTestId('change-password-selector')).toBeDefined();
        expect(screen.getByTestId('delete-account-selector')).toBeDefined();

        expect(screen.queryByTestId('theme-selector')).toBeNull();
        expect(screen.queryByTestId('language-selector')).toBeNull();
    });

    it('renders null when activeTab is "account" but currentUser is null', () => {
        const { container } = render(
            <SettingsTabContent
                {...defaultProps}
                activeTab="account"
                currentUser={null}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders null when activeTab is unknown', () => {
        const { container } = render(
            <SettingsTabContent
                {...defaultProps}
                activeTab="unknown-tab"
            />
        );

        expect(container.firstChild).toBeNull();
    });
});

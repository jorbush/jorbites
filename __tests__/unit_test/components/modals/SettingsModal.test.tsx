import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import {
    vi,
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
} from 'vitest';
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

vi.mock('@/app/components/settings/ThemeSelector', () => ({
    default: () => <div>ThemeSelector</div>,
}));

vi.mock(
    '@/app/components/settings/LanguageSelector',
    () => ({
        default: () => <div>LanguageSelector</div>,
    })
);

vi.mock(
    '@/app/components/settings/EmailNotificationsSelector',
    () => ({
        default: () => (
            <div>EmailNotificationsSelector</div>
        ),
    })
);

vi.mock(
    '@/app/components/settings/ChangeUserImage',
    () => ({
        default: () => <div>ChangeUserImageSelector</div>,
    })
);

const mockSettingsModalClose = vi.fn();

const mockUseSettingsModal = {
    isOpen: true,
    onClose: mockSettingsModalClose,
};

(useSettingsModal as any).mockReturnValue(
    mockUseSettingsModal
);

describe('SettingsModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the settings modal', () => {
        render(<SettingsModal currentUser={null} />);
        expect(
            screen.getByText('set_your_preferences')
        ).toBeDefined();
        expect(
            screen.getByText('ThemeSelector')
        ).toBeDefined();
        expect(
            screen.getByText('LanguageSelector')
        ).toBeDefined();
    });

    it('renders user-specific settings when currentUser is provided', () => {
        const currentUser = {
            id: '1',
            name: 'Test User',
        } as SafeUser;
        render(<SettingsModal currentUser={currentUser} />);
        expect(
            screen.getByText('EmailNotificationsSelector')
        ).toBeDefined();
        expect(
            screen.getByText('ChangeUserImageSelector')
        ).toBeDefined();
    });
});

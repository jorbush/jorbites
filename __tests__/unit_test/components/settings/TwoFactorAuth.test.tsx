import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TwoFactorAuth from '@/app/components/settings/TwoFactorAuth';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeUser } from '@/app/types';

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('TwoFactorAuth Component', () => {
    const disabledUser = {
        id: 'user-1',
        name: 'Test Chef',
        email: 'chef@jorbites.com',
        twoFactorEnabled: false,
    } as SafeUser;

    const enabledUser = {
        id: 'user-1',
        name: 'Test Chef',
        email: 'chef@jorbites.com',
        twoFactorEnabled: true,
    } as SafeUser;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders disabled status badge and enable button when 2FA is disabled', () => {
        render(<TwoFactorAuth currentUser={disabledUser} />);

        expect(screen.getByTestId('two-factor-status-badge').textContent).toBe(
            'two_factor_disabled_badge'
        );
        expect(screen.getByTestId('enable-2fa-button')).toBeDefined();
    });

    it('completes the 3-step setup flow (password -> QR + verify code -> backup codes)', async () => {
        vi.mocked(axios.post)
            .mockResolvedValueOnce({
                data: {
                    secret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
                    otpauthUrl:
                        'otpauth://totp/Jorbites:chef%40jorbites.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Jorbites',
                },
            })
            .mockResolvedValueOnce({
                data: {
                    success: true,
                    backupCodes: ['ABCD-1234', 'EFGH-5678'],
                },
            });

        render(<TwoFactorAuth currentUser={disabledUser} />);

        // Click enable button
        fireEvent.click(screen.getByTestId('enable-2fa-button'));

        // Step 1: Enter current password
        const passwordInput = screen.getByTestId('two-factor-password-input');
        fireEvent.change(passwordInput, {
            target: { value: 'mySecretPassword' },
        });
        fireEvent.click(screen.getByTestId('continue-2fa-setup-button'));

        // Step 2: QR code & verification code input
        await waitFor(() => {
            expect(screen.getByTestId('two-factor-verify-form')).toBeDefined();
            expect(screen.getByTestId('two-factor-qr-code')).toBeDefined();
            expect(
                screen.getByTestId('two-factor-secret-key').textContent
            ).toBe('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP');
        });

        const codeInput = screen.getByTestId('two-factor-code-input');
        fireEvent.change(codeInput, { target: { value: '123456' } });
        fireEvent.click(screen.getByTestId('verify-and-enable-2fa-button'));

        // Step 3: Backup codes displayed
        await waitFor(() => {
            expect(
                screen.getByTestId('two-factor-backup-codes-panel')
            ).toBeDefined();
            expect(screen.getByText('ABCD-1234')).toBeDefined();
            expect(screen.getByText('EFGH-5678')).toBeDefined();
            expect(toast.success).toHaveBeenCalledWith(
                'two_factor_enabled_success'
            );
        });
    });

    it('renders enabled status badge and allows disabling 2FA with password confirmation', async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({
            data: { success: true },
        });

        render(<TwoFactorAuth currentUser={enabledUser} />);

        expect(screen.getByTestId('two-factor-status-badge').textContent).toBe(
            'two_factor_enabled_badge'
        );

        fireEvent.click(screen.getByTestId('disable-2fa-button'));

        const passwordInput = screen.getByTestId('disable-2fa-password-input');
        fireEvent.change(passwordInput, {
            target: { value: 'mySecretPassword' },
        });
        fireEvent.click(screen.getByTestId('confirm-disable-2fa-button'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/2fa/disable', {
                currentPassword: 'mySecretPassword',
            });
            expect(toast.success).toHaveBeenCalledWith(
                'two_factor_disabled_success'
            );
            expect(mockRefresh).toHaveBeenCalled();
        });
    });
});

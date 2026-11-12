'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw, FiShield } from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import { useTwoFactorAuth } from './useTwoFactorAuth';
import { TwoFactorAuthHeader } from './TwoFactorAuthHeader';
import { TwoFactorPasswordForm } from './TwoFactorPasswordForm';
import { TwoFactorSetupVerifyForm } from './TwoFactorSetupVerifyForm';
import { TwoFactorBackupCodesView } from './TwoFactorBackupCodesView';

interface TwoFactorAuthProps {
    currentUser?: SafeUser | null;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const {
        mode,
        setMode,
        isPending,
        isEnabled,
        currentPassword,
        setCurrentPassword,
        showPassword,
        setShowPassword,
        secret,
        otpauthUrl,
        verificationCode,
        setVerificationCode,
        backupCodes,
        copiedSecret,
        copiedBackupCodes,
        passwordInputId,
        verificationCodeId,
        passwordRegisterProps,
        handleStartSetup,
        handleVerifyAndEnable,
        handleDisable2FA,
        handleRegenerateBackupCodes,
        handleCopySecret,
        handleCopyBackupCodes,
        handleDownloadBackupCodes,
        resetState,
    } = useTwoFactorAuth({ currentUser });

    const toggleShowPassword = () => setShowPassword(!showPassword);

    return (
        <div
            className="flex flex-col gap-4"
            data-testid="two-factor-auth-selector"
            data-cy="two-factor-auth-section"
        >
            <TwoFactorAuthHeader
                isEnabled={isEnabled}
                mode={mode}
                isPending={isPending}
                onStartSetup={() => {
                    setCurrentPassword('');
                    setMode('setup-password');
                }}
                onStartRegenerate={() => {
                    setCurrentPassword('');
                    setMode('regenerate-password');
                }}
                onStartDisable={() => {
                    setCurrentPassword('');
                    setMode('disable-password');
                }}
                onCancel={resetState}
            />

            {/* Step 1: Confirm Password to start 2FA setup */}
            {mode === 'setup-password' && (
                <TwoFactorPasswordForm
                    id={passwordInputId}
                    promptText={
                        t('two_factor_confirm_password_prompt') ||
                        'Confirm your current password to begin setting up two-factor authentication.'
                    }
                    buttonLabel={t('continue') || 'Continue'}
                    buttonIcon={FiShield}
                    buttonVariant="green"
                    currentPassword={currentPassword}
                    passwordRegisterProps={passwordRegisterProps}
                    showPassword={showPassword}
                    onToggleShowPassword={toggleShowPassword}
                    isPending={isPending}
                    formTestId="two-factor-setup-password-form"
                    passwordTestId="two-factor-password-input"
                    togglePasswordTestId="toggle-two-factor-password"
                    buttonTestId="continue-2fa-setup-button"
                    buttonDataCy="continue-2fa-setup-button"
                    onSubmit={handleStartSetup}
                />
            )}

            {/* Step 2: Scan QR Code & Verify 6-digit TOTP Code */}
            {mode === 'setup-verify' && (
                <TwoFactorSetupVerifyForm
                    id={verificationCodeId}
                    otpauthUrl={otpauthUrl}
                    secret={secret}
                    verificationCode={verificationCode}
                    isPending={isPending}
                    copiedSecret={copiedSecret}
                    onVerificationCodeChange={setVerificationCode}
                    onCopySecret={handleCopySecret}
                    onSubmit={handleVerifyAndEnable}
                />
            )}

            {/* Step 3: View Backup Recovery Codes */}
            {mode === 'backup-codes-view' && backupCodes.length > 0 && (
                <TwoFactorBackupCodesView
                    backupCodes={backupCodes}
                    copiedBackupCodes={copiedBackupCodes}
                    onCopy={handleCopyBackupCodes}
                    onDownload={handleDownloadBackupCodes}
                    onDone={resetState}
                />
            )}

            {/* Regenerate Backup Codes Password Confirmation */}
            {mode === 'regenerate-password' && (
                <TwoFactorPasswordForm
                    id={passwordInputId}
                    promptText={
                        t('regenerate_backup_codes_prompt') ||
                        'Enter your current password to generate a new set of recovery codes. Your previous recovery codes will be invalidated.'
                    }
                    buttonLabel={
                        t('regenerate_backup_codes') || 'Regenerate Codes'
                    }
                    buttonIcon={FiRefreshCw}
                    buttonVariant="green"
                    currentPassword={currentPassword}
                    passwordRegisterProps={passwordRegisterProps}
                    showPassword={showPassword}
                    onToggleShowPassword={toggleShowPassword}
                    isPending={isPending}
                    formTestId="regenerate-backup-codes-form"
                    passwordTestId="regenerate-2fa-password-input"
                    togglePasswordTestId="toggle-regenerate-2fa-password"
                    buttonTestId="confirm-regenerate-backup-codes-button"
                    onSubmit={handleRegenerateBackupCodes}
                />
            )}

            {/* Disable 2FA Password Confirmation */}
            {mode === 'disable-password' && (
                <TwoFactorPasswordForm
                    id={passwordInputId}
                    promptText={
                        t('disable_2fa_prompt') ||
                        'Confirm your current password to disable two-factor authentication on your account.'
                    }
                    buttonLabel={t('disable_2fa') || 'Disable 2FA'}
                    buttonVariant="red"
                    currentPassword={currentPassword}
                    passwordRegisterProps={passwordRegisterProps}
                    showPassword={showPassword}
                    onToggleShowPassword={toggleShowPassword}
                    isPending={isPending}
                    formTestId="disable-2fa-form"
                    passwordTestId="disable-2fa-password-input"
                    togglePasswordTestId="toggle-disable-2fa-password"
                    buttonTestId="confirm-disable-2fa-button"
                    buttonDataCy="confirm-disable-2fa-button"
                    onSubmit={handleDisable2FA}
                />
            )}
        </div>
    );
};

export default TwoFactorAuth;

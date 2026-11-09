'use client';

import { useRouter } from 'next/navigation';
import React, { useId, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    FiCheck,
    FiCopy,
    FiDownload,
    FiEdit3,
    FiRefreshCw,
    FiShield,
} from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import { PasswordFieldInput } from './PasswordFieldInput';
import { generateQrMatrix } from '@/app/utils/qrcode';

interface TwoFactorAuthProps {
    currentUser?: SafeUser | null;
}

type FlowMode =
    | 'idle'
    | 'setup-password'
    | 'setup-verify'
    | 'backup-codes-view'
    | 'regenerate-password'
    | 'disable-password';

const TwoFactorQrCode: React.FC<{ value: string }> = ({ value }) => {
    const matrix = useMemo(() => {
        try {
            return generateQrMatrix(value);
        } catch {
            return null;
        }
    }, [value]);

    if (!matrix || matrix.length === 0) return null;

    const size = matrix.length;
    const quietZone = 2;
    const viewBoxSize = size + quietZone * 2;

    return (
        <div
            className="inline-flex items-center justify-center rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-xs"
            data-testid="two-factor-qr-code"
        >
            <svg
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                className="size-44"
                shapeRendering="crispEdges"
                role="img"
                aria-label="QR Code"
            >
                <rect
                    width={viewBoxSize}
                    height={viewBoxSize}
                    fill="#ffffff"
                />
                {matrix.map((row, r) =>
                    row.map((isDark, c) =>
                        isDark ? (
                            <rect
                                key={`${r}-${c}`}
                                x={c + quietZone}
                                y={r + quietZone}
                                width={1}
                                height={1}
                                fill="#171717"
                            />
                        ) : null
                    )
                )}
            </svg>
        </div>
    );
};

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ currentUser }) => {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [mode, setMode] = useState<FlowMode>('idle');
    const [isPending, startTransition] = useTransition();

    const [currentPassword, setCurrentPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [secret, setSecret] = useState('');
    const [otpauthUrl, setOtpauthUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

    const passwordInputId = useId();
    const verificationCodeId = useId();

    const isEnabled = Boolean(currentUser?.twoFactorEnabled);

    const resetState = () => {
        setMode('idle');
        setCurrentPassword('');
        setShowPassword(false);
        setSecret('');
        setOtpauthUrl('');
        setVerificationCode('');
    };

    const handleStartSetup = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || !currentPassword) return;

        startTransition(async () => {
            try {
                const response = await axios.post('/api/2fa/setup', {
                    currentPassword,
                });
                setSecret(response.data.secret);
                setOtpauthUrl(response.data.otpauthUrl);
                setCurrentPassword('');
                setMode('setup-verify');
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.error || t('something_went_wrong');
                toast.error(errorMessage);
            }
        });
    };

    const handleVerifyAndEnable = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || !verificationCode.trim()) return;

        startTransition(async () => {
            try {
                const response = await axios.post('/api/2fa/enable', {
                    code: verificationCode.trim(),
                });
                setBackupCodes(response.data.backupCodes || []);
                setVerificationCode('');
                setMode('backup-codes-view');
                toast.success(
                    t('two_factor_enabled_success') ||
                        'Two-factor authentication enabled'
                );
                refresh?.();
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.error ||
                    t('invalid_2fa_code') ||
                    'Invalid verification code';
                toast.error(errorMessage);
            }
        });
    };

    const handleDisable2FA = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || !currentPassword) return;

        startTransition(async () => {
            try {
                await axios.post('/api/2fa/disable', {
                    currentPassword,
                });
                toast.success(
                    t('two_factor_disabled_success') ||
                        'Two-factor authentication disabled'
                );
                resetState();
                setBackupCodes([]);
                refresh?.();
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.error || t('something_went_wrong');
                toast.error(errorMessage);
            }
        });
    };

    const handleRegenerateBackupCodes = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || !currentPassword) return;

        startTransition(async () => {
            try {
                const response = await axios.post('/api/2fa/backup-codes', {
                    currentPassword,
                });
                setBackupCodes(response.data.backupCodes || []);
                setCurrentPassword('');
                setMode('backup-codes-view');
                toast.success(
                    t('backup_codes_regenerated') ||
                        'Backup recovery codes regenerated'
                );
                refresh?.();
            } catch (error: any) {
                const errorMessage =
                    error.response?.data?.error || t('something_went_wrong');
                toast.error(errorMessage);
            }
        });
    };

    const handleCopySecret = async () => {
        if (!secret) return;
        try {
            await navigator.clipboard?.writeText(secret);
            setCopiedSecret(true);
            toast.success(t('copied') || 'Copied!');
            setTimeout(() => setCopiedSecret(false), 2000);
        } catch {
            toast.error(t('something_went_wrong'));
        }
    };

    const handleCopyBackupCodes = async () => {
        if (backupCodes.length === 0) return;
        try {
            await navigator.clipboard?.writeText(backupCodes.join('\n'));
            setCopiedBackupCodes(true);
            toast.success(t('copied') || 'Copied!');
            setTimeout(() => setCopiedBackupCodes(false), 2000);
        } catch {
            toast.error(t('something_went_wrong'));
        }
    };

    const handleDownloadBackupCodes = () => {
        if (backupCodes.length === 0) return;
        const content = [
            'Jorbites - Two-Factor Authentication Backup Recovery Codes',
            '==========================================================',
            'Each code can only be used once. Store them in a safe place.',
            '',
            ...backupCodes,
            '',
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'jorbites-2fa-backup-codes.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const hidePasswordText = t('hide_password') || 'Hide password';
    const showPasswordText = t('show_password') || 'Show password';

    const passwordRegisterProps = {
        name: 'currentPassword',
        onChange: async (e: any) => {
            setCurrentPassword(e.target.value);
        },
        onBlur: async () => {},
        ref: () => {},
    };

    return (
        <div
            className="flex flex-col gap-4"
            data-testid="two-factor-auth-selector"
            data-cy="two-factor-auth-section"
        >
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-left text-neutral-900 dark:text-white">
                            {t('two_factor_auth') ||
                                'Two-Factor Authentication'}
                        </p>
                        <span
                            data-testid="two-factor-status-badge"
                            className={
                                isEnabled
                                    ? 'border-green-450/50 bg-green-450 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-neutral-900'
                                    : 'rounded-full border border-neutral-200/80 bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-400'
                            }
                        >
                            {isEnabled
                                ? t('two_factor_enabled_badge') || 'Enabled'
                                : t('two_factor_disabled_badge') || 'Disabled'}
                        </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('two_factor_description') ||
                            'Protect your account with an authenticator app (TOTP) and recovery codes'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {mode === 'idle' ? (
                        isEnabled ? (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentPassword('');
                                        setMode('regenerate-password');
                                    }}
                                    className="cursor-pointer rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                                    data-testid="regenerate-backup-codes-button"
                                >
                                    {t('regenerate_backup_codes') ||
                                        'Backup Codes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentPassword('');
                                        setMode('disable-password');
                                    }}
                                    className="cursor-pointer rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/40"
                                    data-testid="disable-2fa-button"
                                    data-cy="disable-2fa-button"
                                >
                                    {t('disable_2fa') || 'Disable'}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentPassword('');
                                    setMode('setup-password');
                                }}
                                aria-label={String(
                                    t('enable_2fa') || 'Enable 2FA'
                                )}
                                data-testid="enable-2fa-button"
                                data-cy="enable-2fa-button"
                                className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                            >
                                <FiEdit3 className="size-4" />
                            </button>
                        )
                    ) : (
                        <button
                            type="button"
                            onClick={resetState}
                            disabled={isPending}
                            data-testid="cancel-2fa-button"
                            className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                    )}
                </div>
            </div>

            {/* Step 1: Confirm Password to start 2FA setup */}
            {mode === 'setup-password' && (
                <form
                    onSubmit={handleStartSetup}
                    className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
                    data-testid="two-factor-setup-password-form"
                >
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        {t('two_factor_confirm_password_prompt') ||
                            'Confirm your current password to begin setting up two-factor authentication.'}
                    </p>
                    <PasswordFieldInput
                        id={passwordInputId}
                        label={t('current_password') || 'Current Password'}
                        placeholder={
                            t('enter_current_password') ||
                            'Enter current password'
                        }
                        registerProps={passwordRegisterProps}
                        showPassword={showPassword}
                        onToggleShowPassword={() =>
                            setShowPassword(!showPassword)
                        }
                        disabled={isPending}
                        testId="two-factor-password-input"
                        toggleTestId="toggle-two-factor-password"
                        hidePasswordLabel={hidePasswordText}
                        showPasswordLabel={showPasswordText}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending || !currentPassword}
                            data-testid="continue-2fa-setup-button"
                            data-cy="continue-2fa-setup-button"
                            className="border-green-450/50 bg-green-450 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-neutral-900 shadow-xs transition hover:opacity-90 disabled:opacity-50"
                        >
                            <FiShield className="size-4" />
                            {isPending
                                ? t('loading') || 'Loading...'
                                : t('continue') || 'Continue'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: Scan QR Code & Verify 6-digit TOTP Code */}
            {mode === 'setup-verify' && (
                <form
                    onSubmit={handleVerifyAndEnable}
                    className="flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
                    data-testid="two-factor-verify-form"
                >
                    <div className="flex flex-col items-center gap-3 text-center">
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">
                            {t('two_factor_scan_qr_instructions') ||
                                'Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password), or enter the setup key manually.'}
                        </p>
                        {otpauthUrl && <TwoFactorQrCode value={otpauthUrl} />}
                    </div>

                    {secret && (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                {t('two_factor_manual_key') ||
                                    'Manual setup key'}
                            </span>
                            <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 dark:border-neutral-700/60 dark:bg-neutral-800/60">
                                <code
                                    className="font-mono text-xs break-all text-neutral-900 dark:text-white"
                                    data-testid="two-factor-secret-key"
                                >
                                    {secret}
                                </code>
                                <button
                                    type="button"
                                    onClick={handleCopySecret}
                                    aria-label={String(
                                        t('copy_secret_key') || 'Copy setup key'
                                    )}
                                    data-testid="copy-secret-key-button"
                                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700/60 dark:hover:text-white"
                                >
                                    {copiedSecret ? (
                                        <FiCheck className="size-4" />
                                    ) : (
                                        <FiCopy className="size-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor={verificationCodeId}
                            className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                        >
                            {t('verification_code') || 'Verification Code'}
                        </label>
                        <input
                            id={verificationCodeId}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) =>
                                setVerificationCode(
                                    e.target.value.replace(/\D/g, '')
                                )
                            }
                            placeholder="000000"
                            disabled={isPending}
                            data-testid="two-factor-code-input"
                            data-cy="two-factor-code-input"
                            className="focus:ring-green-450/30 w-full rounded-xl border border-neutral-200/80 bg-white px-3 py-2 font-mono text-sm tracking-widest text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                isPending || verificationCode.length !== 6
                            }
                            data-testid="verify-and-enable-2fa-button"
                            data-cy="verify-and-enable-2fa-button"
                            className="border-green-450/50 bg-green-450 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-neutral-900 shadow-xs transition hover:opacity-90 disabled:opacity-50"
                        >
                            <FiCheck className="size-4" />
                            {isPending
                                ? t('verifying') || 'Verifying...'
                                : t('verify_and_enable') || 'Verify & Enable'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 3: View Backup Recovery Codes */}
            {mode === 'backup-codes-view' && backupCodes.length > 0 && (
                <div
                    className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
                    data-testid="two-factor-backup-codes-panel"
                >
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {t('backup_recovery_codes') ||
                                'Backup Recovery Codes'}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {t('backup_codes_instructions') ||
                                'Save these recovery codes in a safe place. Each code can be used once to sign in if you lose access to your authenticator app.'}
                        </p>
                    </div>

                    <div
                        className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 font-mono text-xs text-neutral-900 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-white"
                        data-testid="backup-codes-list"
                    >
                        {backupCodes.map((code) => (
                            <span
                                key={code}
                                className="rounded-md bg-white/80 px-2 py-1 text-center dark:bg-neutral-900/60"
                            >
                                {code}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopyBackupCodes}
                                data-testid="copy-backup-codes-button"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                            >
                                {copiedBackupCodes ? (
                                    <FiCheck className="size-3.5" />
                                ) : (
                                    <FiCopy className="size-3.5" />
                                )}
                                {t('copy_codes') || 'Copy codes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadBackupCodes}
                                data-testid="download-backup-codes-button"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                            >
                                <FiDownload className="size-3.5" />
                                {t('download_codes') || 'Download .txt'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={resetState}
                            data-testid="done-backup-codes-button"
                            className="border-green-450/50 bg-green-450 cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold text-neutral-900 shadow-xs"
                        >
                            {t('done') || 'Done'}
                        </button>
                    </div>
                </div>
            )}

            {/* Regenerate Backup Codes Password Confirmation */}
            {mode === 'regenerate-password' && (
                <form
                    onSubmit={handleRegenerateBackupCodes}
                    className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
                    data-testid="regenerate-backup-codes-form"
                >
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        {t('regenerate_backup_codes_prompt') ||
                            'Enter your current password to generate a new set of recovery codes. Your previous recovery codes will be invalidated.'}
                    </p>
                    <PasswordFieldInput
                        id={passwordInputId}
                        label={t('current_password') || 'Current Password'}
                        placeholder={
                            t('enter_current_password') ||
                            'Enter current password'
                        }
                        registerProps={passwordRegisterProps}
                        showPassword={showPassword}
                        onToggleShowPassword={() =>
                            setShowPassword(!showPassword)
                        }
                        disabled={isPending}
                        testId="regenerate-2fa-password-input"
                        toggleTestId="toggle-regenerate-2fa-password"
                        hidePasswordLabel={hidePasswordText}
                        showPasswordLabel={showPasswordText}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending || !currentPassword}
                            data-testid="confirm-regenerate-backup-codes-button"
                            className="border-green-450/50 bg-green-450 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-neutral-900 shadow-xs transition hover:opacity-90 disabled:opacity-50"
                        >
                            <FiRefreshCw className="size-4" />
                            {isPending
                                ? t('loading') || 'Loading...'
                                : t('regenerate_backup_codes') ||
                                  'Regenerate Codes'}
                        </button>
                    </div>
                </form>
            )}

            {/* Disable 2FA Password Confirmation */}
            {mode === 'disable-password' && (
                <form
                    onSubmit={handleDisable2FA}
                    className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
                    data-testid="disable-2fa-form"
                >
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        {t('disable_2fa_prompt') ||
                            'Confirm your current password to disable two-factor authentication on your account.'}
                    </p>
                    <PasswordFieldInput
                        id={passwordInputId}
                        label={t('current_password') || 'Current Password'}
                        placeholder={
                            t('enter_current_password') ||
                            'Enter current password'
                        }
                        registerProps={passwordRegisterProps}
                        showPassword={showPassword}
                        onToggleShowPassword={() =>
                            setShowPassword(!showPassword)
                        }
                        disabled={isPending}
                        testId="disable-2fa-password-input"
                        toggleTestId="toggle-disable-2fa-password"
                        hidePasswordLabel={hidePasswordText}
                        showPasswordLabel={showPasswordText}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending || !currentPassword}
                            data-testid="confirm-disable-2fa-button"
                            data-cy="confirm-disable-2fa-button"
                            className="flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-50"
                        >
                            {isPending
                                ? t('saving') || 'Saving...'
                                : t('disable_2fa') || 'Disable 2FA'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default TwoFactorAuth;

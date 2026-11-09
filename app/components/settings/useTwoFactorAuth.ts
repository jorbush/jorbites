'use client';

import { useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { SafeUser } from '@/app/types';

export type FlowMode =
    | 'idle'
    | 'setup-password'
    | 'setup-verify'
    | 'backup-codes-view'
    | 'regenerate-password'
    | 'disable-password';

const EMPTY_CODES: string[] = [];

interface UseTwoFactorAuthOptions {
    currentUser?: SafeUser | null;
}

export function useTwoFactorAuth({ currentUser }: UseTwoFactorAuthOptions) {
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const [mode, setMode] = useState<FlowMode>('idle');
    const [isPending, startTransition] = useTransition();

    const [currentPassword, setCurrentPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [secret, setSecret] = useState('');
    const [otpauthUrl, setOtpauthUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>(EMPTY_CODES);
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
                setBackupCodes(response.data.backupCodes || EMPTY_CODES);
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
                setBackupCodes(EMPTY_CODES);
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
                setBackupCodes(response.data.backupCodes || EMPTY_CODES);
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

    const passwordRegisterProps = {
        name: 'currentPassword',
        onChange: async (e: any) => {
            setCurrentPassword(e.target.value);
        },
        onBlur: async () => {},
        ref: () => {},
    };

    return {
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
    };
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { TwoFactorQrCode } from './TwoFactorQrCode';

interface TwoFactorSetupVerifyFormProps {
    id: string;
    otpauthUrl: string;
    secret: string;
    verificationCode: string;
    isPending: boolean;
    copiedSecret: boolean;
    onVerificationCodeChange: (val: string) => void;
    onCopySecret: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const TwoFactorSetupVerifyForm: React.FC<
    TwoFactorSetupVerifyFormProps
> = ({
    id,
    otpauthUrl,
    secret,
    verificationCode,
    isPending,
    copiedSecret,
    onVerificationCodeChange,
    onCopySecret,
    onSubmit,
}) => {
    const { t } = useTranslation();

    return (
        <form
            onSubmit={onSubmit}
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
                        {t('two_factor_manual_key') || 'Manual setup key'}
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
                            onClick={onCopySecret}
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
                    htmlFor={id}
                    className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                >
                    {t('verification_code') || 'Verification Code'}
                </label>
                <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) =>
                        onVerificationCodeChange(
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
                    disabled={isPending || verificationCode.length !== 6}
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
    );
};

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

interface LoginTwoFactorStepProps {
    twoFactorCode: string;
    isPending: boolean;
    onChangeCode: (code: string) => void;
    onBackToLogin: () => void;
}

export const LoginTwoFactorStep: React.FC<LoginTwoFactorStepProps> = ({
    twoFactorCode,
    isPending,
    onChangeCode,
    onBackToLogin,
}) => {
    const { t } = useTranslation();

    return (
        <div
            className="flex flex-col gap-4"
            data-testid="login-2fa-step"
        >
            <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800">
                    <FiShield className="size-5 text-neutral-900 dark:text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {t('two_factor_auth') || 'Two-Factor Authentication'}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {t('enter_2fa_code_subtitle') ||
                            'Enter the 6-digit code from your authenticator app or a backup recovery code.'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="login-two-factor-code"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                    {t('verification_code') || 'Verification Code'}
                </label>
                <input
                    id="login-two-factor-code"
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    value={twoFactorCode}
                    onChange={(e) => onChangeCode(e.target.value)}
                    placeholder="000000 / XXXX-XXXX"
                    disabled={isPending}
                    data-cy="login-2fa-code"
                    data-testid="login-2fa-code-input"
                    className="focus:ring-green-450/30 w-full rounded-xl border border-neutral-200/80 bg-white/80 px-4 py-3 font-mono text-base tracking-widest text-neutral-900 transition outline-none focus:border-neutral-400 focus:ring-2 disabled:opacity-50 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-white"
                />
            </div>

            <div>
                <button
                    type="button"
                    onClick={onBackToLogin}
                    disabled={isPending}
                    data-testid="back-to-login-button"
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
                >
                    <FiArrowLeft className="size-4" />
                    {t('back_to_login') || 'Back to login'}
                </button>
            </div>
        </div>
    );
};

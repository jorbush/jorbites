import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit3 } from 'react-icons/fi';
import { FlowMode } from './useTwoFactorAuth';

interface TwoFactorAuthHeaderProps {
    isEnabled: boolean;
    mode: FlowMode;
    isPending: boolean;
    onStartSetup: () => void;
    onStartRegenerate: () => void;
    onStartDisable: () => void;
    onCancel: () => void;
}

export const TwoFactorAuthHeader: React.FC<TwoFactorAuthHeaderProps> = ({
    isEnabled,
    mode,
    isPending,
    onStartSetup,
    onStartRegenerate,
    onStartDisable,
    onCancel,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-left text-neutral-900 dark:text-white">
                        {t('two_factor_auth') || 'Two-Factor Authentication'}
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
                                onClick={onStartRegenerate}
                                className="cursor-pointer rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                                data-testid="regenerate-backup-codes-button"
                            >
                                {t('regenerate_backup_codes') || 'Backup Codes'}
                            </button>
                            <button
                                type="button"
                                onClick={onStartDisable}
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
                            onClick={onStartSetup}
                            aria-label={String(t('enable_2fa') || 'Enable 2FA')}
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
                        onClick={onCancel}
                        disabled={isPending}
                        data-testid="cancel-2fa-button"
                        className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                        {t('cancel') || 'Cancel'}
                    </button>
                )}
            </div>
        </div>
    );
};

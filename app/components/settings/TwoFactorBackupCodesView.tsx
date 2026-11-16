import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiCopy, FiDownload } from 'react-icons/fi';

interface TwoFactorBackupCodesViewProps {
    backupCodes: string[];
    copiedBackupCodes: boolean;
    onCopy: () => void;
    onDownload: () => void;
    onDone: () => void;
}

export const TwoFactorBackupCodesView: React.FC<
    TwoFactorBackupCodesViewProps
> = ({ backupCodes, copiedBackupCodes, onCopy, onDownload, onDone }) => {
    const { t } = useTranslation();

    return (
        <div
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60"
            data-testid="two-factor-backup-codes-panel"
        >
            <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {t('backup_recovery_codes') || 'Backup Recovery Codes'}
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
                        onClick={onCopy}
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
                        onClick={onDownload}
                        data-testid="download-backup-codes-button"
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                    >
                        <FiDownload className="size-3.5" />
                        {t('download_codes') || 'Download .txt'}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onDone}
                    data-testid="done-backup-codes-button"
                    className="border-green-450/50 bg-green-450 cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold text-neutral-900 shadow-xs"
                >
                    {t('done') || 'Done'}
                </button>
            </div>
        </div>
    );
};

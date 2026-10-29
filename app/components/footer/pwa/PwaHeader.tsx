'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import {
    FiDownload,
    FiCheckCircle,
    FiChevronDown,
    FiChevronUp,
} from 'react-icons/fi';

interface PwaHeaderProps {
    isInstalled: boolean;
    hasDeferredPrompt: boolean;
    isExpanded: boolean;
    onInstall: () => void;
    onToggle: () => void;
}

const PwaHeader: React.FC<PwaHeaderProps> = ({
    isInstalled,
    hasDeferredPrompt,
    isExpanded,
    onInstall,
    onToggle,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-neutral-800">
                    <Image
                        src="/avocado.webp"
                        alt="Jorbites"
                        width={28}
                        height={28}
                        className="size-7 object-contain"
                    />
                </div>
                <div>
                    <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                        {t('footer_pwa_title')}
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        {t('footer_pwa_description')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isInstalled && (
                    <span
                        data-testid="pwa-installed-badge"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                        <FiCheckCircle className="size-3.5" />
                        {t('footer_pwa_btn_installed')}
                    </span>
                )}

                {hasDeferredPrompt && !isInstalled && (
                    <button
                        type="button"
                        onClick={onInstall}
                        data-testid="pwa-install-button"
                        className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    >
                        <FiDownload className="size-3.5" />
                        {t('footer_pwa_btn_install')}
                    </button>
                )}

                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isExpanded}
                    aria-label={String(
                        isExpanded
                            ? t('footer_pwa_toggle_hide')
                            : t('footer_pwa_toggle_show')
                    )}
                    data-testid="pwa-toggle-button"
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                    <span>
                        {isExpanded
                            ? t('footer_pwa_toggle_hide')
                            : t('footer_pwa_toggle_show')}
                    </span>
                    {isExpanded ? (
                        <FiChevronUp className="size-3.5" />
                    ) : (
                        <FiChevronDown className="size-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default PwaHeader;

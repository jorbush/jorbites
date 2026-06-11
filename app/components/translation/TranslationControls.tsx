'use client';

import React from 'react';
import { FiGlobe } from 'react-icons/fi';

interface TranslationControlsProps {
    showTranslateButton: boolean;
    isTranslated: boolean;
    isTranslating: boolean;
    onTranslate: () => void;
    onShowOriginal: () => void;
    t: (key: string) => string;
}

export const TranslationControls: React.FC<TranslationControlsProps> = ({
    showTranslateButton,
    isTranslated,
    isTranslating,
    onTranslate,
    onShowOriginal,
    t,
}) => {
    if (!showTranslateButton) return null;

    return (
        <>
            {!isTranslated ? (
                <button
                    type="button"
                    onClick={onTranslate}
                    disabled={isTranslating}
                    className="inline-flex cursor-pointer items-center gap-1 text-sm text-neutral-600 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-200"
                    title={t('translate') || 'Translate'}
                    aria-label={t('translate') || 'Translate'}
                >
                    <FiGlobe
                        size={18}
                        className={isTranslating ? 'animate-spin' : ''}
                    />
                    <span className="text-xs">
                        {isTranslating
                            ? t('translating') || 'Translating...'
                            : t('translate') || 'Translate'}
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onShowOriginal}
                    className="inline-flex cursor-pointer items-center gap-1 text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    <FiGlobe size={18} />
                    <span className="text-xs">
                        {t('show_original') || 'Show original'}
                    </span>
                </button>
            )}
        </>
    );
};

export default TranslationControls;

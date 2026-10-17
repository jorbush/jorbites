'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiExternalLink, FiChevronDown } from 'react-icons/fi';
import { CMS_URL, CMS_EVENTS_URL, CMS_BLOGS_URL } from '@/app/utils/constants';

export interface CmsSubmitButtonProps {
    target?: 'events' | 'blogs' | 'all';
    className?: string;
    size?: 'sm' | 'md';
}

const CmsSubmitButton: React.FC<CmsSubmitButtonProps> = ({
    target = 'all',
    className = '',
    size = 'sm',
}) => {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const sizeClasses =
        size === 'md'
            ? 'px-4 py-2 text-sm gap-2'
            : 'px-3 py-1.5 text-xs sm:text-sm gap-1.5';

    const baseClasses = `group inline-flex items-center rounded-full border border-neutral-200/90 bg-neutral-50/70 font-medium text-neutral-600 backdrop-blur-xs transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${sizeClasses} ${className}`;

    if (target === 'events') {
        return (
            <a
                href={CMS_EVENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={String(
                    t(
                        'cms_submission_tooltip',
                        'Open content manager to propose events or articles'
                    )
                )}
                className={baseClasses}
                data-testid="cms-submit-event-btn"
            >
                <span className="text-xs">📅</span>
                <span>{t('propose_event', 'Propose Event')}</span>
                <FiExternalLink className="size-3.5 opacity-60 transition group-hover:opacity-100" />
            </a>
        );
    }

    if (target === 'blogs') {
        return (
            <a
                href={CMS_BLOGS_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={String(
                    t(
                        'cms_submission_tooltip',
                        'Open content manager to propose events or articles'
                    )
                )}
                className={baseClasses}
                data-testid="cms-submit-blog-btn"
            >
                <span className="text-xs">✍️</span>
                <span>{t('propose_blog', 'Propose Article')}</span>
                <FiExternalLink className="size-3.5 opacity-60 transition group-hover:opacity-100" />
            </a>
        );
    }

    // target === 'all': Minimalist dropdown menu
    return (
        <div
            className="relative inline-block"
            ref={dropdownRef}
        >
            <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={baseClasses}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                data-testid="cms-submit-content-btn"
            >
                <span className="text-xs">🥑</span>
                <span>{t('submit_content_cms', 'Submit Content')}</span>
                <FiChevronDown
                    className={`size-3.5 opacity-60 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/95 p-1.5 text-xs shadow-lg backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/95 dark:text-neutral-200">
                    <a
                        href={CMS_EVENTS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                        <span className="text-base">📅</span>
                        <div className="flex-1">
                            <div className="font-medium text-neutral-900 dark:text-white">
                                {t('propose_event', 'Propose Event')}
                            </div>
                            <div className="text-[11px] text-neutral-500">
                                {t(
                                    'events_cms_desc',
                                    'Cooking contests & challenges'
                                )}
                            </div>
                        </div>
                        <FiExternalLink className="size-3 opacity-50" />
                    </a>

                    <a
                        href={CMS_BLOGS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                        <span className="text-base">✍️</span>
                        <div className="flex-1">
                            <div className="font-medium text-neutral-900 dark:text-white">
                                {t('propose_blog', 'Propose Article')}
                            </div>
                            <div className="text-[11px] text-neutral-500">
                                {t('blogs_cms_desc', 'Stories, recipes & news')}
                            </div>
                        </div>
                        <FiExternalLink className="size-3 opacity-50" />
                    </a>

                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                    <a
                        href={CMS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-1.5 text-[11px] text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-300"
                    >
                        <span>{t('content_cms', 'Content Manager')}</span>
                        <FiExternalLink className="size-2.5 opacity-50" />
                    </a>
                </div>
            )}
        </div>
    );
};

export default CmsSubmitButton;

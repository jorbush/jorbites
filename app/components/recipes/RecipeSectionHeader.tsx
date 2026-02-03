'use client';

import { toast } from 'react-hot-toast';
import { FiLink } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface RecipeSectionHeaderProps {
    id: string;
    title: React.ReactNode;
    count?: number | string;
    className?: string;
}

const RecipeSectionHeader: React.FC<RecipeSectionHeaderProps> = ({
    id,
    title,
    count,
    className = '',
}) => {
    const { t } = useTranslation();

    const handleCopyLink = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (typeof window !== 'undefined') {
            const url = `${window.location.origin}${window.location.pathname}#${id}`;
            navigator.clipboard
                .writeText(url)
                .then(() => {
                    toast.success(t('link_copied') || 'Link copied!', {
                        id: 'copy-link-toast',
                    });
                })
                .catch(() => {
                    toast.error(t('copy_failed') || 'Failed to copy link', {
                        id: 'copy-link-error',
                    });
                });
        }
    };

    return (
        <div
            id={id}
            className={`group flex scroll-mt-24 items-center justify-between gap-2 ${className}`}
        >
            <div className="flex flex-row items-center gap-2 text-xl font-semibold dark:text-neutral-100">
                {title}
                <button
                    onClick={handleCopyLink}
                    className="cursor-pointer rounded-full p-1 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-800 focus:opacity-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                    aria-label={t('copy_link') || 'Copy link'}
                    title={t('copy_link') || 'Copy link'}
                >
                    <FiLink size={18} />
                </button>
            </div>
            {count !== undefined && (
                <div className="text-md text-neutral-500 dark:text-neutral-400">
                    {count}
                </div>
            )}
        </div>
    );
};

export default RecipeSectionHeader;

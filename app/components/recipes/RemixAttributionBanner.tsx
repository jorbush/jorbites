'use client';

import React from 'react';
import Link from 'next/link';
import { TbGitFork } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import useIsMounted from '@/app/hooks/useIsMounted';

interface RemixAttributionBannerProps {
    forkedFromRecipe?: {
        id: string;
        title: string;
        imageSrc?: string;
        user?: {
            id: string;
            name: string | null;
            image?: string | null;
        } | null;
    } | null;
    forkedFromRecipeId?: string | null;
}

export const RemixAttributionBanner: React.FC<RemixAttributionBannerProps> = ({
    forkedFromRecipe,
    forkedFromRecipeId,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    if (!forkedFromRecipe && !forkedFromRecipeId) {
        return null;
    }

    const remixedFromText = mounted
        ? t('remixed_from', { defaultValue: 'Remixed from' })
        : 'Remixed from';
    const byText = mounted ? t('by_author', { defaultValue: 'by' }) : 'by';
    const earlierRecipeText = mounted
        ? t('earlier_recipe', { defaultValue: 'an earlier recipe' })
        : 'an earlier recipe';

    return (
        <div
            className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-sm text-neutral-800 shadow-xs dark:border-amber-800/40 dark:bg-amber-950/25 dark:text-neutral-200"
            data-cy="remix-attribution-banner"
            data-testid="remix-attribution-banner"
        >
            <TbGitFork
                size={18}
                className="shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
            />
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>{remixedFromText}</span>
                {forkedFromRecipe ? (
                    <>
                        <Link
                            href={`/recipes/${forkedFromRecipe.id}`}
                            className="font-semibold text-neutral-900 underline decoration-amber-400 underline-offset-2 transition-colors hover:text-amber-700 dark:text-neutral-100 dark:hover:text-amber-300"
                        >
                            {forkedFromRecipe.title}
                        </Link>
                        {forkedFromRecipe.user && (
                            <>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    {byText}
                                </span>
                                <Link
                                    href={`/profile/${forkedFromRecipe.user.id}`}
                                    className="font-medium text-neutral-800 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-amber-700 dark:text-neutral-200 dark:hover:text-amber-300"
                                >
                                    @{forkedFromRecipe.user.name || 'Chef'}
                                </Link>
                            </>
                        )}
                    </>
                ) : (
                    <span className="text-neutral-500 italic dark:text-neutral-400">
                        {earlierRecipeText}
                    </span>
                )}
            </div>
        </div>
    );
};

export default RemixAttributionBanner;

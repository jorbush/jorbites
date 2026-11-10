'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { TbGitFork } from 'react-icons/tb';
import { SafeRecipe, SafeUser } from '@/app/types';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import Avatar from '@/app/components/utils/Avatar';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';
import useIsMounted from '@/app/hooks/useIsMounted';

export type RemixRecipeItem = SafeRecipe & {
    user?: {
        id?: string;
        name?: string | null;
        image?: string | null;
    } | null;
};

interface RecipeRemixesSectionProps {
    originalRecipeId?: string;
    remixes?: RemixRecipeItem[];
    currentUser?: SafeUser | null;
}

export const RecipeRemixesSection: React.FC<RecipeRemixesSectionProps> = ({
    remixes,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    if (!remixes || remixes.length === 0) {
        return null;
    }

    const title = mounted
        ? t('community_remixes', {
              defaultValue: 'Remixes',
          })
        : 'Remixes';

    return (
        <div
            className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90"
            data-cy="community-remixes-section"
            data-testid="community-remixes-section"
        >
            <div className="mb-4 flex flex-row items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-700 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300">
                    <TbGitFork
                        size={18}
                        aria-hidden="true"
                    />
                </div>
                <div className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {title}
                </div>
            </div>

            <ScrollableContainer
                className="gap-4"
                fadeColorClassName="from-white dark:from-dark"
            >
                {remixes.map((item) => (
                    <Link
                        key={item.id}
                        href={`/recipes/${item.id}`}
                        className="group w-44 shrink-0 cursor-pointer text-left focus:outline-hidden"
                        data-cy={`remix-card-${item.id}`}
                        data-testid={`remix-card-${item.id}`}
                    >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-neutral-200/60 bg-neutral-100 shadow-xs transition-transform duration-200 group-hover:scale-[1.02] dark:border-neutral-800 dark:bg-neutral-800">
                            {item.imageSrc && (
                                <CustomProxyImage
                                    src={item.imageSrc}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    quality="auto:good"
                                />
                            )}
                            {Boolean(item.minutes) && (
                                <div className="absolute bottom-2 left-2 z-10 rounded-md bg-neutral-950/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
                                    {item.minutes} min
                                </div>
                            )}
                        </div>

                        <div className="decoration-green-450 mt-2 line-clamp-1 font-bold text-neutral-900 decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline dark:text-white">
                            {item.title}
                        </div>

                        {item.user && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                <Avatar
                                    src={item.user.image}
                                    size={18}
                                />
                                <span className="truncate">
                                    {item.user.name || 'Chef'}
                                </span>
                            </div>
                        )}
                    </Link>
                ))}
            </ScrollableContainer>
        </div>
    );
};

export default RecipeRemixesSection;

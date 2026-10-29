'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
    originalRecipeId: string;
    remixes?: RemixRecipeItem[];
    currentUser?: SafeUser | null;
}

export const RecipeRemixesSection: React.FC<RecipeRemixesSectionProps> = ({
    remixes,
}) => {
    const { push } = useRouter() || {};
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
            className="flex flex-col pr-2 pl-2"
            data-cy="community-remixes-section"
            data-testid="community-remixes-section"
        >
            <hr />
            <div className="mt-8 mb-4 flex flex-row items-center gap-2">
                <TbGitFork
                    size={22}
                    className="text-neutral-700 dark:text-neutral-200"
                    aria-hidden="true"
                />
                <div className="text-xl font-semibold dark:text-neutral-100">
                    {title}
                </div>
            </div>

            <ScrollableContainer className="gap-4">
                {remixes.map((item) => (
                    <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => push(`/recipes/${item.id}`)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                push(`/recipes/${item.id}`);
                            }
                        }}
                        className="group w-44 shrink-0 cursor-pointer text-left focus:outline-hidden"
                        data-cy={`remix-card-${item.id}`}
                        data-testid={`remix-card-${item.id}`}
                    >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 shadow-xs transition-transform duration-200 group-hover:scale-[1.02] dark:bg-neutral-800">
                            {item.imageSrc && (
                                <CustomProxyImage
                                    src={item.imageSrc}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    quality="auto:good"
                                />
                            )}
                            {item.minutes && (
                                <div className="absolute bottom-2 left-2 z-10 rounded-md bg-neutral-950/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
                                    {item.minutes} min
                                </div>
                            )}
                        </div>

                        <div className="group-hover:text-green-450 dark:group-hover:text-green-450 mt-2 line-clamp-1 font-semibold text-neutral-800 transition dark:text-neutral-100">
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
                    </div>
                ))}
            </ScrollableContainer>
        </div>
    );
};

export default RecipeRemixesSection;

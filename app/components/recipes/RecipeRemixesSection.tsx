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
import useLoginModal from '@/app/hooks/useLoginModal';
import Button from '@/app/components/buttons/Button';

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

const EMPTY_REMIXES: RemixRecipeItem[] = [];

export const RecipeRemixesSection: React.FC<RecipeRemixesSectionProps> = ({
    originalRecipeId,
    remixes = EMPTY_REMIXES,
    currentUser,
}) => {
    const { push } = useRouter() || {};
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const loginModal = useLoginModal();

    const title = mounted
        ? t('community_remixes', {
              defaultValue: 'Community Remixes & Variations',
          })
        : 'Community Remixes & Variations';

    const onRemixClick = () => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        push(`/recipes/create?forkFrom=${originalRecipeId}`);
    };

    if (remixes.length === 0) {
        return (
            <div
                className="flex flex-col pr-2 pl-2"
                data-cy="community-remixes-section"
                data-testid="community-remixes-section"
            >
                <hr />
                <div className="mt-8 mb-4 flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <TbGitFork
                            size={22}
                            className="text-neutral-700 dark:text-neutral-200"
                            aria-hidden="true"
                        />
                        <div className="text-xl font-semibold dark:text-neutral-100">
                            {title}
                        </div>
                        <div className="text-md ml-1 text-neutral-500">(0)</div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {mounted
                            ? t('no_community_remixes', {
                                  defaultValue:
                                      'No remixes yet. Customize this recipe and make it your own!',
                              })
                            : 'No remixes yet. Customize this recipe and make it your own!'}
                    </p>
                    <div className="mt-3 w-[200px]">
                        <Button
                            label={
                                mounted
                                    ? String(
                                          t('remix_recipe', {
                                              defaultValue: 'Remix Recipe',
                                          })
                                      )
                                    : 'Remix Recipe'
                            }
                            icon={TbGitFork}
                            outline
                            small
                            onClick={onRemixClick}
                            dataTestId="empty-section-remix-btn"
                            dataCy="empty-section-remix-btn"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col pr-2 pl-2"
            data-cy="community-remixes-section"
            data-testid="community-remixes-section"
        >
            <hr />
            <div className="mt-8 mb-4 flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                    <TbGitFork
                        size={22}
                        className="text-neutral-700 dark:text-neutral-200"
                        aria-hidden="true"
                    />
                    <div className="text-xl font-semibold dark:text-neutral-100">
                        {title}
                    </div>
                    <div className="text-md ml-1 text-neutral-500">
                        ({remixes.length})
                    </div>
                </div>
                <div className="w-[150px]">
                    <Button
                        label={
                            mounted
                                ? String(
                                      t('remix_recipe', {
                                          defaultValue: 'Remix',
                                      })
                                  )
                                : 'Remix'
                        }
                        icon={TbGitFork}
                        outline
                        small
                        onClick={onRemixClick}
                        dataTestId="section-remix-btn"
                        dataCy="section-remix-btn"
                    />
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

                        <div className="mt-2 line-clamp-1 font-semibold text-neutral-800 transition group-hover:text-emerald-600 dark:text-neutral-100 dark:group-hover:text-emerald-400">
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

'use client';

import React from 'react';
import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';
import { formatDistanceToNowLocale } from '@/app/utils/date-utils';
import Avatar from '@/app/components/utils/Avatar';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';

export interface QuestListItem {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string | null;
        image: string | null;
        verified: boolean;
    };
    recipes: Array<{
        id: string;
        title: string;
        imageSrc: string;
        user: {
            id: string;
            name: string | null;
            image: string | null;
        };
    }>;
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'open':
            return (
                <FiCircle
                    className="text-neutral-500 dark:text-neutral-400"
                    size={13}
                />
            );
        case 'in_progress':
            return (
                <FiClock
                    className="dark:text-green-450 text-neutral-800"
                    size={13}
                />
            );
        case 'completed':
            return (
                <FiCheckCircle
                    className="text-neutral-600 dark:text-neutral-300"
                    size={13}
                />
            );
        default:
            return <FiCircle size={13} />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'in_progress':
            return 'border border-green-450/40 bg-green-450/15 text-neutral-800 dark:text-green-450';
        case 'open':
            return 'border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300';
        case 'completed':
            return 'border border-neutral-200/80 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400';
        default:
            return 'border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
};

interface QuestsGridProps {
    quests: QuestListItem[];
    isSearching: boolean;
    onClearSearch: () => void;
    onNavigateQuest: (questId: string) => void;
    onNavigateRecipe: (recipeId: string) => void;
    language: string;
    t: (key: string, defaultValue?: string) => string;
}

export const QuestsGrid: React.FC<QuestsGridProps> = ({
    quests,
    isSearching,
    onClearSearch,
    onNavigateQuest,
    onNavigateRecipe,
    language,
    t,
}) => {
    if (quests.length === 0) {
        if (isSearching) {
            return (
                <EmptySearchResults
                    title={String(
                        t(
                            'no_quests_matching_search',
                            'No quests match your search'
                        )
                    )}
                    subtitle={String(
                        t(
                            'no_search_results_subtitle',
                            'Try searching with different keywords or check your spelling.'
                        )
                    )}
                    clearLabel={String(t('clear_search', 'Clear search'))}
                    onClearSearch={onClearSearch}
                    dataTestId="quests-search-empty"
                />
            );
        }

        return (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-400 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-500">
                    <FiCircle size={22} />
                </div>
                <h3 className="mb-1 text-base font-semibold text-neutral-900 dark:text-white">
                    {t('no_quests') || 'No quests found'}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('no_quests_description') ||
                        'Be the first to request a recipe!'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {quests.map((quest) => (
                <div
                    key={quest.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
                >
                    <div>
                        {/* Quest Header */}
                        <div className="mb-2 flex items-start justify-between gap-3">
                            <h2 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
                                <button
                                    type="button"
                                    className="decoration-green-450 line-clamp-1 cursor-pointer border-0 bg-transparent p-0 text-left text-base font-bold text-neutral-900 decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline hover:underline focus:outline-hidden sm:text-lg dark:text-white"
                                    onClick={() => onNavigateQuest(quest.id)}
                                    data-cy="quest-card-title"
                                >
                                    {quest.title}
                                </button>
                            </h2>
                            <span
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                    quest.status
                                )}`}
                                data-cy="quest-card-status"
                            >
                                {getStatusIcon(quest.status)}
                                <span>{t(quest.status) || quest.status}</span>
                            </span>
                        </div>

                        <p
                            className="line-clamp-2 text-sm leading-relaxed text-neutral-600 sm:line-clamp-3 dark:text-neutral-400"
                            data-cy="quest-card-description"
                        >
                            {quest.description}
                        </p>
                    </div>

                    {/* Quest Bottom Shelf / Footer */}
                    <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <Avatar
                                    src={quest.user.image}
                                    size={32}
                                />
                                <div className="flex min-w-0 flex-col">
                                    <span className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                        {quest.user.name}
                                    </span>
                                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        {formatDistanceToNowLocale(
                                            new Date(quest.createdAt),
                                            language
                                        )}
                                    </span>
                                </div>
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                {quest.recipes.length}{' '}
                                {quest.recipes.length === 1
                                    ? t('reply') || 'reply'
                                    : t('replies') || 'replies'}
                            </span>
                        </div>

                        {/* Recipe Replies Preview */}
                        {quest.recipes.length > 0 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pt-1">
                                {quest.recipes.slice(0, 3).map((recipe) => (
                                    <button
                                        key={recipe.id}
                                        type="button"
                                        className="group/reply relative size-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-neutral-200/80 p-0 dark:border-neutral-700/60"
                                        onClick={() =>
                                            onNavigateRecipe(recipe.id)
                                        }
                                        aria-label={recipe.title}
                                    >
                                        <CustomProxyImage
                                            src={
                                                recipe.imageSrc ||
                                                '/avocado.webp'
                                            }
                                            fill
                                            className="object-cover transition-transform duration-200 group-hover/reply:scale-105"
                                            alt={recipe.title}
                                            quality="auto:eco"
                                            width={48}
                                            height={48}
                                        />
                                    </button>
                                ))}
                                {quest.recipes.length > 3 && (
                                    <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800">
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            +{quest.recipes.length - 3}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestsGrid;

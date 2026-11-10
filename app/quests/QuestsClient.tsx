'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import useQuestModal from '@/app/hooks/useQuestModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { FiPlus, FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';
import { FcTodoList } from 'react-icons/fc';
import { formatDistanceToNowLocale } from '@/app/utils/date-utils';
import Avatar from '@/app/components/utils/Avatar';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import Pagination from '@/app/components/navigation/Pagination';

interface Quest {
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

interface QuestsClientProps {
    currentUser?: SafeUser | null;
    quests: Quest[];
    totalPages: number;
    currentPage: number;
    initialStatus?: string;
}

const QuestsClient: React.FC<QuestsClientProps> = ({
    currentUser,
    quests,
    totalPages,
    currentPage,
    initialStatus = 'open',
}) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};
    const questModal = useQuestModal();
    const loginModal = useLoginModal();

    const getInitialFilter = () => {
        if (
            initialStatus === 'open' ||
            initialStatus === 'in_progress' ||
            initialStatus === 'completed' ||
            initialStatus === 'all'
        ) {
            return initialStatus;
        }
        return 'open';
    };

    const [filter, setFilter] = useState<
        'all' | 'open' | 'in_progress' | 'completed'
    >(() => getInitialFilter());

    const handleRequestRecipe = () => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }
        questModal.onOpenCreate();
    };

    const handleFilterChange = (newFilter: typeof filter) => {
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        if (newFilter !== 'open') {
            params.set('status', newFilter);
        } else {
            params.delete('status');
        }
        params.set('page', '1');
        const queryString = params.toString();
        push(queryString ? `/quests?${queryString}` : '/quests');
    };

    const navigateToRecipe = (recipeId: string) => {
        push(`/recipes/${recipeId}`);
    };

    const navigateToQuest = (questId: string) => {
        push(`/quests/${questId}`);
    };

    return (
        <div className="pt-2 pb-12 sm:pt-4">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                        <FcTodoList size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                            {t('quests') || 'Recipe Quests'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t('quests_subtitle') ||
                                'Request recipes from the community or fulfill existing requests'}
                        </p>
                    </div>
                </div>
                <div className="hidden md:block md:flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleRequestRecipe}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                        data-cy="request-recipe-button"
                    >
                        <FiPlus size={18} />
                        <span>{t('request_recipe') || 'Request Recipe'}</span>
                    </button>
                </div>
            </div>

            {/* Filters Row with Horizontal Scroll */}
            <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <div className="flex min-w-max gap-2 pb-2">
                    {(['open', 'in_progress', 'completed', 'all'] as const).map(
                        (status) => {
                            const isActive = filter === status;
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleFilterChange(status)}
                                    className={`flex-shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                                        isActive
                                            ? 'border-green-450/50 bg-green-450 hover:bg-green-450/90 border font-semibold text-neutral-900 shadow-xs'
                                            : 'border border-neutral-200/80 bg-neutral-50/80 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    {t(status) || status.replace('_', ' ')}
                                </button>
                            );
                        }
                    )}
                </div>
            </div>

            {/* Floating Action Button for mobile (below md) */}
            <button
                type="button"
                onClick={handleRequestRecipe}
                className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                data-cy="request-recipe-button-mobile"
                aria-label={t('request_recipe') || 'Request Recipe'}
            >
                <FiPlus className="size-6" />
            </button>

            {/* Quests Grid */}
            {quests.length === 0 ? (
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
            ) : (
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
                                            className="hover:text-green-450 dark:hover:text-green-450 group-hover:text-green-450 dark:group-hover:text-green-450 decoration-green-450 line-clamp-1 cursor-pointer border-0 bg-transparent p-0 text-left text-base font-bold text-neutral-900 decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline hover:underline focus:outline-hidden sm:text-lg dark:text-white"
                                            onClick={() =>
                                                navigateToQuest(quest.id)
                                            }
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
                                        <span>
                                            {t(quest.status) || quest.status}
                                        </span>
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
                                                    i18n.language
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
                                        {quest.recipes
                                            .slice(0, 3)
                                            .map((recipe) => (
                                                <button
                                                    key={recipe.id}
                                                    type="button"
                                                    className="group/reply relative size-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-neutral-200/80 p-0 dark:border-neutral-700/60"
                                                    onClick={() =>
                                                        navigateToRecipe(
                                                            recipe.id
                                                        )
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        searchParams={{
                            status: filter !== 'all' ? filter : undefined,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default QuestsClient;

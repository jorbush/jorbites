'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import useQuestModal from '@/app/hooks/useQuestModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { FiPlus, FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';
import { formatDistance } from 'date-fns';
import Avatar from '@/app/components/utils/Avatar';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import Pagination from '@/app/components/navigation/Pagination';
import { FcTodoList } from 'react-icons/fc';
import Button from '@/app/components/utils/Button';

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

interface QuestsClientProps {
    currentUser?: SafeUser | null;
    quests: Quest[];
    totalPages: number;
    currentPage: number;
}

const QuestsClient: React.FC<QuestsClientProps> = ({
    currentUser,
    quests,
    totalPages,
    currentPage,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const questModal = useQuestModal();
    const loginModal = useLoginModal();

    const getInitialFilter = () => {
        const status = searchParams?.get('status') || 'all';
        if (
            status === 'open' ||
            status === 'in_progress' ||
            status === 'completed'
        ) {
            return status;
        }
        return 'all';
    };

    const [filter, setFilter] = useState<
        'all' | 'open' | 'in_progress' | 'completed'
    >(getInitialFilter());

    const handleRequestRecipe = () => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }
        questModal.onOpenCreate();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <FiCircle className="text-blue-500" />;
            case 'in_progress':
                return <FiClock className="text-yellow-500" />;
            case 'completed':
                return <FiCheckCircle className="text-green-500" />;
            default:
                return <FiCircle />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const handleFilterChange = (newFilter: typeof filter) => {
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        if (newFilter !== 'all') {
            params.set('status', newFilter);
        } else {
            params.delete('status');
        }
        params.set('page', '1');
        router.push(`/quests?${params.toString()}`);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <FcTodoList className="mb-2 h-10 w-10" />
                        <h1 className="pb-2 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('quests') || 'Recipe Quests'}
                        </h1>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t('quests_subtitle') ||
                            'Request recipes from the community or fulfill existing requests'}
                    </p>
                </div>
                <Button
                    rose
                    onClick={handleRequestRecipe}
                    label={t('request_recipe') || 'Request Recipe'}
                    icon={FiPlus}
                    dataCy="request-recipe-button"
                    custom="hidden w-full md:block md:w-auto"
                />
            </div>

            {/* Filters Row with Horizontal Scroll */}
            <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <div className="flex min-w-max gap-2 pb-2">
                    {(['all', 'open', 'in_progress', 'completed'] as const).map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => handleFilterChange(status)}
                                className={`flex-shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
                                    filter === status
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {t(status) || status.replace('_', ' ')}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Floating Action Button for mobile (below md) */}
            <Button
                rose
                onClick={handleRequestRecipe}
                label=""
                icon={FiPlus}
                custom="fixed right-6 bottom-16 z-10 h-14 w-14 rounded-full flex items-center justify-center shadow-lg md:hidden"
                ariaLabel={t('request_recipe') || 'Request Recipe'}
                dataCy="request-recipe-button-mobile"
            />

            {/* Quests Grid */}
            {quests.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                    <FiCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        {t('no_quests') || 'No quests found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('no_quests_description') ||
                            'Be the first to request a recipe!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {quests.map((quest) => (
                        <div
                            key={quest.id}
                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="p-6">
                                {/* Quest Header */}
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            {getStatusIcon(quest.status)}
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                                    quest.status
                                                )}`}
                                            >
                                                {t(quest.status) ||
                                                    quest.status}
                                            </span>
                                        </div>
                                        <h2
                                            className="mb-2 cursor-pointer text-xl font-semibold text-gray-900 hover:text-rose-500 dark:text-white dark:hover:text-rose-400"
                                            onClick={() =>
                                                router.push(
                                                    `/quests/${quest.id}`
                                                )
                                            }
                                        >
                                            {quest.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {quest.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Quest Footer */}
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={quest.user.image}
                                            size={32}
                                        />
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {quest.user.name}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {formatDistance(
                                                    new Date(quest.createdAt),
                                                    new Date(),
                                                    { addSuffix: true }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {quest.recipes.length}{' '}
                                            {quest.recipes.length === 1
                                                ? t('reply') || 'reply'
                                                : t('replies') || 'replies'}
                                        </span>
                                    </div>
                                </div>

                                {/* Recipe Replies Preview */}
                                {quest.recipes.length > 0 && (
                                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                        <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('recipe_replies') ||
                                                'Recipe Replies'}
                                        </p>
                                        <div className="flex gap-2 overflow-x-auto">
                                            {quest.recipes
                                                .slice(0, 4)
                                                .map((recipe) => (
                                                    <div
                                                        key={recipe.id}
                                                        className="group relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg"
                                                        onClick={() =>
                                                            router.push(
                                                                `/recipes/${recipe.id}`
                                                            )
                                                        }
                                                    >
                                                        <CustomProxyImage
                                                            src={
                                                                recipe.imageSrc ||
                                                                '/avocado.webp'
                                                            }
                                                            fill
                                                            className="object-cover transition group-hover:scale-110"
                                                            alt={recipe.title}
                                                            quality="auto:eco"
                                                            width={80}
                                                            height={80}
                                                        />
                                                    </div>
                                                ))}
                                            {quest.recipes.length > 4 && (
                                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        +
                                                        {quest.recipes.length -
                                                            4}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
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

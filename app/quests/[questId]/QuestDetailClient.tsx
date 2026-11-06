'use client';

import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import {
    FiCheckCircle,
    FiClock,
    FiCircle,
    FiEdit,
    FiTrash,
    FiChevronLeft,
    FiShare2,
} from 'react-icons/fi';
import { formatDistanceToNowLocale } from '@/app/utils/date-utils';
import Avatar from '@/app/components/utils/Avatar';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import useQuestModal from '@/app/hooks/useQuestModal';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import useShare from '@/app/hooks/useShare';

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
        description: string;
        imageSrc: string;
        categories: string[];
        method: string;
        minutes: number;
        numLikes: number;
        ingredients: string[];
        steps: string[];
        extraImages: string[];
        userId: string;
        coCooksIds: string[];
        linkedRecipeIds: string[];
        listIds: string[];
        youtubeUrl: string | null;
        questId: string | null;
        createdAt: string;
        averageRating: number;
        ratingCount: number;
        user: {
            id: string;
            name: string | null;
            image: string | null;
            verified: boolean;
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

interface QuestDetailClientProps {
    currentUser?: SafeUser | null;
    quest: Quest;
}

const QuestDetailClient: React.FC<QuestDetailClientProps> = ({
    currentUser,
    quest,
}) => {
    const { t, i18n } = useTranslation();
    const { back, push, refresh } = useRouter() || {};
    const questModal = useQuestModal();
    const recipeModal = useRecipeModal();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { share } = useShare();

    const isOwner = currentUser?.id === quest.user.id;

    const handleEdit = () => {
        questModal.onOpenEdit({
            id: quest.id,
            title: quest.title,
            description: quest.description,
            status: quest.status,
            recipes: quest.recipes,
        });
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setShowDeleteModal(false);
        try {
            await axios.delete(`/api/quest/${quest.id}`);
            toast.success(t('quest_deleted') || 'Quest deleted successfully');
            push('/quests');
            refresh();
        } catch (error: any) {
            console.error('Failed to delete quest', error);
            toast.error(
                error.response?.data?.error ||
                    t('something_went_wrong') ||
                    'Something went wrong'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ConfirmModal
                open={showDeleteModal}
                setIsOpen={setShowDeleteModal}
                onConfirm={handleDelete}
                description={
                    t('confirm_delete_quest') ||
                    'Are you sure you want to delete this quest?'
                }
            />
            <div className="mx-auto max-w-[800px] px-4 pt-2 pb-12 sm:px-6 sm:pt-4">
                {/* Top Navigation & Actions Bar */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => back()}
                        className="group inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                        <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                            <FiChevronLeft size={18} />
                        </div>
                        <span>{t('back') || 'Back'}</span>
                    </button>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => share({ title: quest.title })}
                            aria-label={t('share_quest') || 'Share Quest'}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                            data-cy="share-quest"
                        >
                            <FiShare2 size={16} />
                        </button>
                        {isOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    aria-label={t('edit_quest') || 'Edit Quest'}
                                    className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                                    data-cy="edit-quest"
                                >
                                    <FiEdit size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    aria-label={
                                        t('delete_quest') || 'Delete Quest'
                                    }
                                    className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-red-200/80 bg-red-50 text-red-600 shadow-2xs transition-colors duration-200 hover:border-red-300 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-800"
                                    data-cy="delete-quest"
                                >
                                    <FiTrash size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Quest Header */}
                <div className="mb-8 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
                    <div className="mb-3 flex items-start justify-between gap-4">
                        <h1
                            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                            data-cy="quest-title-display"
                        >
                            {quest.title}
                        </h1>
                        <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                quest.status
                            )}`}
                            data-cy="quest-status-display"
                        >
                            {getStatusIcon(quest.status)}
                            <span>{t(quest.status) || quest.status}</span>
                        </span>
                    </div>

                    <p
                        className="mb-6 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400"
                        data-cy="quest-description-display"
                    >
                        {quest.description}
                    </p>

                    <div className="flex flex-col justify-between gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={quest.user.image}
                                size={40}
                            />
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">
                                    {quest.user.name}
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {formatDistanceToNowLocale(
                                        new Date(quest.createdAt),
                                        i18n.language
                                    )}
                                </p>
                            </div>
                        </div>
                        {currentUser && quest.status !== 'completed' && (
                            <button
                                type="button"
                                onClick={() =>
                                    recipeModal.onOpenCreate(quest.id)
                                }
                                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                                data-cy="fulfill-quest"
                            >
                                {t('fulfill_quest') || 'Fulfill This Request'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Recipe Replies */}
                <div>
                    <h2 className="mb-4 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                        {t('recipe_replies') || 'Recipe Replies'}
                    </h2>
                    {quest.recipes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {t('no_recipes_yet') ||
                                    'No recipes have been submitted yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            {quest.recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    data={recipe}
                                    currentUser={currentUser}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default QuestDetailClient;

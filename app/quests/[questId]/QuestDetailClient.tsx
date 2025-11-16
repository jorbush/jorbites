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
} from 'react-icons/fi';
import { formatDistance } from 'date-fns';
import Avatar from '@/app/components/utils/Avatar';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import useQuestModal from '@/app/hooks/useQuestModal';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

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
        category: string;
        method: string;
        minutes: number;
        numLikes: number;
        ingredients: string[];
        steps: string[];
        extraImages: string[];
        userId: string;
        coCooksIds: string[];
        linkedRecipeIds: string[];
        youtubeUrl: string | null;
        questId: string | null;
        createdAt: string;
        user: {
            id: string;
            name: string | null;
            image: string | null;
            verified: boolean;
        };
    }>;
}

interface QuestDetailClientProps {
    currentUser?: SafeUser | null;
    quest: Quest;
}

const QuestDetailClient: React.FC<QuestDetailClientProps> = ({
    currentUser,
    quest,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const questModal = useQuestModal();
    const recipeModal = useRecipeModal();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isOwner = currentUser?.id === quest.user.id;

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

    const handleEdit = () => {
        questModal.onOpenEdit({
            id: quest.id,
            title: quest.title,
            description: quest.description,
            status: quest.status,
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
            router.push('/quests');
            router.refresh();
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
            <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <FiChevronLeft className="cursor-pointer text-xl" />
                    <span>{t('back') || 'Back'}</span>
                </button>

                {/* Quest Header */}
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(quest.status)}
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                                    quest.status
                                )}`}
                                data-cy="quest-status-display"
                            >
                                {t(quest.status) || quest.status}
                            </span>
                        </div>
                        {isOwner && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEdit}
                                    aria-label={t('edit_quest') || 'Edit Quest'}
                                    className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    data-cy="edit-quest"
                                >
                                    <FiEdit />
                                </button>
                                <button
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    aria-label={
                                        t('delete_quest') || 'Delete Quest'
                                    }
                                    className="cursor-pointer rounded-lg border border-red-300 px-4 py-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                                    data-cy="delete-quest"
                                >
                                    <FiTrash />
                                </button>
                            </div>
                        )}
                    </div>

                    <h1
                        className="mb-4 text-3xl font-bold text-gray-900 dark:text-white"
                        data-cy="quest-title-display"
                    >
                        {quest.title}
                    </h1>
                    <p
                        className="mb-6 text-gray-600 dark:text-gray-400"
                        data-cy="quest-description-display"
                    >
                        {quest.description}
                    </p>

                    <div className="flex flex-col justify-between gap-5 border-t border-gray-200 pt-4 md:flex-row md:items-center dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={quest.user.image}
                                size={40}
                            />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {quest.user.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDistance(
                                        new Date(quest.createdAt),
                                        new Date(),
                                        { addSuffix: true }
                                    )}
                                </p>
                            </div>
                        </div>
                        {currentUser && quest.status !== 'completed' && (
                            <button
                                onClick={() =>
                                    recipeModal.onOpenCreate(quest.id)
                                }
                                className="cursor-pointer rounded-lg bg-rose-500 px-6 py-2 text-white transition hover:bg-rose-600"
                                data-cy="fulfill-quest"
                            >
                                {t('fulfill_quest') || 'Fulfill This Request'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Recipe Replies */}
                <div>
                    <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        {t('recipe_replies') || 'Recipe Replies'} (
                        {quest.recipes.length})
                    </h2>
                    {quest.recipes.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('no_recipes_yet') ||
                                    'No recipes have been submitted yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

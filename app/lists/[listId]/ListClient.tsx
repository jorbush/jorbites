'use client';

import { SafeList, SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import { useCallback, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import { AiOutlineDelete } from 'react-icons/ai';
import { GiPadlock, GiPadlockOpen } from 'react-icons/gi';
import { FiShare2, FiChevronLeft } from 'react-icons/fi';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import useShare from '@/app/hooks/useShare';
import VerificationBadge from '@/app/components/VerificationBadge';

interface ListClientProps {
    list: SafeList;
    recipes: (SafeRecipe & { user: SafeUser })[];
    currentUser?: SafeUser | null;
}

const ListClient: React.FC<ListClientProps> = ({
    list,
    recipes,
    currentUser,
}) => {
    const { push, refresh, back } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const { share } = useShare();
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const isOwner = currentUser?.id === list.userId;
    const defaultListTitle = t('to_cook_later') as string;
    const shareTitle = list.isDefault ? defaultListTitle : list.name;

    const togglePrivacy = useCallback(async () => {
        if (!isOwner) return;
        setIsLoading(true);
        try {
            await axios.patch(`/api/lists/${list.id}`, {
                isPrivate: !list.isPrivate,
            });
            toast.success(
                list.isPrivate
                    ? t('list_is_now_public')
                    : t('list_is_now_private')
            );
            refresh();
        } catch (error) {
            toast.error(t('something_went_wrong'));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isOwner, list.id, list.isPrivate, refresh, t]);

    const onDelete = useCallback(async () => {
        if (!isOwner) return;
        setIsLoading(true);
        try {
            await axios.delete(`/api/lists/${list.id}`);
            toast.success(t('list_deleted'));
            push('/lists');
            refresh();
        } catch (error) {
            toast.error(t('something_went_wrong'));
            console.error(error);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
        }
    }, [isOwner, list.id, push, refresh, t]);

    const onRemoveRecipe = useCallback(
        async (recipeId: string) => {
            if (!isOwner) return;
            setDeletingId(recipeId);
            try {
                await axios.delete(`/api/lists/${list.id}/recipes/${recipeId}`);
                toast.success(t('recipe_removed'));
                refresh();
            } catch (error) {
                toast.error(t('something_went_wrong'));
                console.error(error);
            } finally {
                setDeletingId('');
            }
        },
        [isOwner, list.id, refresh, t]
    );

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                {/* Top Navigation & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => (back ? back() : push('/lists'))}
                        className="group inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        data-cy="back-button"
                    >
                        <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                            <FiChevronLeft size={18} />
                        </div>
                        <span>{t('back') || 'Back'}</span>
                    </button>

                    {/* Action Controls */}
                    {(!list.isPrivate || isOwner) && (
                        <div className="flex flex-wrap items-center gap-2">
                            {!list.isPrivate && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        share({
                                            title: shareTitle,
                                        })
                                    }
                                    className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                                    aria-label={t('share') || 'Share'}
                                    title={t('share') || 'Share'}
                                    data-cy="share-list-button"
                                >
                                    <FiShare2 size={16} />
                                </button>
                            )}

                            {isOwner && (
                                <>
                                    <button
                                        type="button"
                                        onClick={togglePrivacy}
                                        disabled={isLoading}
                                        data-cy="toggle-list-privacy"
                                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                                        title={
                                            (list.isPrivate
                                                ? t('private')
                                                : t('public')) || ''
                                        }
                                    >
                                        {list.isPrivate ? (
                                            <GiPadlock
                                                size={16}
                                                className="text-neutral-700 dark:text-neutral-300"
                                                data-testid="lock-icon"
                                            />
                                        ) : (
                                            <GiPadlockOpen
                                                size={16}
                                                className="text-neutral-700 dark:text-neutral-300"
                                                data-testid="lock-open-icon"
                                            />
                                        )}
                                    </button>
                                    {!list.isDefault && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsConfirmModalOpen(true)
                                            }
                                            disabled={isLoading}
                                            data-cy="delete-list-button"
                                            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-red-200/80 bg-red-50 text-red-600 shadow-2xs transition-colors duration-200 hover:border-red-300 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-800"
                                            title={
                                                t('delete_list') ||
                                                'Delete list'
                                            }
                                        >
                                            <AiOutlineDelete size={16} />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* List Header Card */}
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
                    {/* List Title & Date */}
                    <div className="mb-5">
                        <h1
                            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
                            data-cy="list-title"
                        >
                            {list.isDefault ? t('to_cook_later') : list.name}
                        </h1>
                        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                            {formatDate(list.createdAt, i18n.language)}
                        </p>
                    </div>

                    {/* User Shelf & Recipes Count */}
                    <div className="flex flex-col justify-between gap-4 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                        {list.user ? (
                            <div className="flex items-center gap-3">
                                <Avatar
                                    src={list.user.image}
                                    size={42}
                                    onClick={() =>
                                        push?.(`/profile/${list.user!.id}`)
                                    }
                                    quality="auto:eco"
                                />
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer text-left text-base font-semibold text-neutral-900 transition-colors duration-200 focus:outline-hidden sm:text-lg dark:text-white"
                                            onClick={() =>
                                                push?.(
                                                    `/profile/${list.user!.id}`
                                                )
                                            }
                                        >
                                            {list.user.name}
                                        </button>
                                        {list.user.verified && (
                                            <VerificationBadge size={18} />
                                        )}
                                    </div>
                                    {typeof list.user.level === 'number' && (
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {`${t('level')} ${list.user.level}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div />
                        )}
                        <div
                            className="self-end text-xs font-semibold text-neutral-600 sm:self-auto dark:text-neutral-300"
                            data-cy="list-recipes-count"
                        >
                            {`${recipes.length} ${recipes.length === 1 ? t('recipe') : t('recipes')}`}
                        </div>
                    </div>
                </div>

                {recipes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                        <p className="text-sm">
                            {t('list_no_recipes') ||
                                'No recipes in this list yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {recipes.map((recipe) => (
                            <RecipeCard
                                currentUser={currentUser}
                                key={recipe.id}
                                data={recipe}
                                user={recipe.user}
                                onAction={isOwner ? onRemoveRecipe : undefined}
                                disabled={deletingId === recipe.id}
                                actionLabel={t('delete') || 'Delete'}
                                actionIcon={
                                    isOwner ? AiOutlineDelete : undefined
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
            <ConfirmModal
                open={isConfirmModalOpen}
                setIsOpen={setIsConfirmModalOpen}
                onConfirm={onDelete}
                description={
                    t('delete_list_confirmation') ||
                    'Are you sure you want to delete this list?'
                }
            />
        </Container>
    );
};

export default ListClient;

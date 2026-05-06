'use client';

import { SafeList, SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import ToggleSwitch from '@/app/components/inputs/ToggleSwitch';
import { useCallback, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Avatar from '@/app/components/utils/Avatar';
import { formatDate } from '@/app/utils/date-utils';
import { AiOutlineDelete } from 'react-icons/ai';
import ConfirmModal from '@/app/components/modals/ConfirmModal';

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
    const router = useRouter();
    const { t } = useTranslation();
    const [isPrivate, setIsPrivate] = useState(list.isPrivate);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const isOwner = currentUser?.id === list.userId;

    const togglePrivacy = useCallback(async () => {
        if (!isOwner) return;
        setIsLoading(true);
        try {
            await axios.patch(`/api/lists/${list.id}`, {
                isPrivate: !isPrivate,
            });
            setIsPrivate(!isPrivate);
            toast.success(
                isPrivate ? t('list_is_now_public') : t('list_is_now_private')
            );
            router.refresh();
        } catch (error) {
            toast.error(t('something_went_wrong'));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isOwner, isPrivate, list.id, router, t]);

    const onDelete = useCallback(async () => {
        if (!isOwner) return;
        setIsLoading(true);
        try {
            await axios.delete(`/api/lists/${list.id}`);
            toast.success(t('list_deleted'));
            router.push('/lists');
            router.refresh();
        } catch (error) {
            toast.error(t('something_went_wrong'));
            console.error(error);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
        }
    }, [isOwner, list.id, router, t]);

    return (
        <Container>
            <div className="flex flex-col gap-6 pb-12 sm:pt-8 dark:text-white">
                <div className="flex flex-row items-start justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="text-3xl font-bold">
                            {list.isDefault ? t('to_cook_later') : list.name}
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <div className="text-sm text-neutral-500">
                                {recipes.length} {t('recipes')}
                            </div>
                            <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                            <div className="text-sm text-neutral-500">
                                {formatDate(list.createdAt)}
                            </div>
                        </div>
                        {list.user && (
                            <div className="mt-2 flex flex-row items-center gap-2">
                                <Avatar
                                    src={list.user.image}
                                    size={24}
                                />
                                <div className="text-sm font-medium">
                                    {list.user.name}
                                </div>
                            </div>
                        )}
                    </div>
                    {isOwner && (
                        <div className="flex flex-row items-center gap-4">
                            <div className="flex flex-row items-center gap-2">
                                <span className="text-sm font-semibold text-neutral-500">
                                    {isPrivate ? t('private') : t('public')}
                                </span>
                                <ToggleSwitch
                                    checked={isPrivate}
                                    onChange={togglePrivacy}
                                    disabled={isLoading}
                                />
                            </div>
                            {!list.isDefault && (
                                <button
                                    onClick={() => setIsConfirmModalOpen(true)}
                                    disabled={isLoading}
                                    className="rounded-full p-2 text-rose-500 transition hover:bg-rose-100 dark:hover:bg-rose-900"
                                    title={t('delete_list') || 'Delete list'}
                                >
                                    <AiOutlineDelete size={24} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {recipes.length === 0 ? (
                    <div className="mt-10 text-center text-neutral-500">
                        {t('list_no_recipes')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {recipes.map((recipe) => (
                            <RecipeCard
                                currentUser={currentUser}
                                key={recipe.id}
                                data={recipe}
                                user={recipe.user}
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

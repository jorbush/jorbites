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
    }, [isOwner, isPrivate, list.id, router]);

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-8 pb-12 dark:text-white">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <div className="text-3xl font-bold">
                            {list.name === 'to cook later'
                                ? t('to_cook_later')
                                : list.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                            {recipes.length} {t('recipes')}
                        </div>
                    </div>
                    {isOwner && (
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
        </Container>
    );
};

export default ListClient;

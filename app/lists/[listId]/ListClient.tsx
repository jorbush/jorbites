'use client';

import React from 'react';
import { SafeList, SafeRecipe, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import { useTranslation } from 'react-i18next';
import useListActions from '@/app/hooks/useListActions';
import ListTopBar from '@/app/components/lists/ListTopBar';
import ListHeaderCard from '@/app/components/lists/ListHeaderCard';
import ListRecipesGrid from '@/app/components/lists/ListRecipesGrid';

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
    const { t } = useTranslation();
    const {
        isOwner,
        shareTitle,
        isLoading,
        deletingId,
        isConfirmModalOpen,
        setIsConfirmModalOpen,
        togglePrivacy,
        onDelete,
        onRemoveRecipe,
    } = useListActions({ list, currentUser });

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                <ListTopBar
                    list={list}
                    shareTitle={shareTitle}
                    isOwner={isOwner}
                    isLoading={isLoading}
                    onTogglePrivacy={togglePrivacy}
                    onOpenDeleteModal={() => setIsConfirmModalOpen(true)}
                />

                <ListHeaderCard
                    list={list}
                    recipesCount={recipes.length}
                />

                <ListRecipesGrid
                    recipes={recipes}
                    currentUser={currentUser}
                    isOwner={isOwner}
                    deletingId={deletingId}
                    onRemoveRecipe={onRemoveRecipe}
                />
            </div>

            <ConfirmModal
                open={isConfirmModalOpen}
                setIsOpen={setIsConfirmModalOpen}
                onConfirm={onDelete}
                description={String(
                    t('delete_list_confirmation') ||
                        'Are you sure you want to delete this list?'
                )}
            />
        </Container>
    );
};

export default ListClient;

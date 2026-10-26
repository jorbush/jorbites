import { create } from 'zustand';
import type { EditRecipeData } from '@/app/types';

export type { EditRecipeData };

export interface RecipeModalStore {
    isOpen: boolean;
    isEditMode: boolean;
    editRecipeData: EditRecipeData | null;
    forkRecipeData: Partial<EditRecipeData> | null;
    forkedFromRecipeId: string | null;
    questId: string | null;
    activeDraftId: string | null;
    onOpen: () => void;
    onOpenCreate: (questId?: string) => void;
    onOpenFork: (
        forkData: Partial<EditRecipeData>,
        forkedFromRecipeId: string
    ) => void;
    onOpenDraft: (draftId: string) => void;
    onOpenSharedDraft: (draftId: string) => void;
    onOpenEdit: (recipeData: EditRecipeData) => void;
    onClose: () => void;
}

const useRecipeModal = create<RecipeModalStore>((set) => ({
    isOpen: false,
    isEditMode: false,
    editRecipeData: null,
    forkRecipeData: null,
    forkedFromRecipeId: null,
    questId: null,
    activeDraftId: null,
    onOpen: () =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: null,
        }),
    onOpenCreate: (questId?: string) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: questId || null,
            activeDraftId: null,
        }),
    onOpenFork: (
        forkData: Partial<EditRecipeData>,
        forkedFromRecipeId: string
    ) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: forkData,
            forkedFromRecipeId: forkedFromRecipeId,
            questId: forkData.questId || null,
            activeDraftId: null,
        }),
    onOpenDraft: (draftId: string) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: draftId,
        }),
    onOpenSharedDraft: (draftId: string) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: draftId,
        }),
    onOpenEdit: (recipeData: EditRecipeData) =>
        set({
            isOpen: true,
            isEditMode: true,
            editRecipeData: recipeData,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: recipeData.questId ?? null,
            activeDraftId: null,
        }),
    onClose: () =>
        set({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            forkRecipeData: null,
            forkedFromRecipeId: null,
            questId: null,
            activeDraftId: null,
        }),
}));

export default useRecipeModal;

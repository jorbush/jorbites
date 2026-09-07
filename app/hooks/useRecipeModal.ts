import { create } from 'zustand';
import { EditRecipeData } from '@/app/types';

export type { EditRecipeData };

export interface RecipeModalStore {
    isOpen: boolean;
    isEditMode: boolean;
    editRecipeData: EditRecipeData | null;
    questId: string | null;
    activeDraftId: string | null;
    onOpen: () => void;
    onOpenCreate: (questId?: string) => void;
    onOpenDraft: (draftId: string) => void;
    onOpenSharedDraft: (draftId: string) => void;
    onOpenEdit: (recipeData: EditRecipeData) => void;
    onClose: () => void;
}

const useRecipeModal = create<RecipeModalStore>((set) => ({
    isOpen: false,
    isEditMode: false,
    editRecipeData: null,
    questId: null,
    activeDraftId: null,
    onOpen: () =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            questId: null,
            activeDraftId: null,
        }),
    onOpenCreate: (questId?: string) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            questId: questId || null,
            activeDraftId: null,
        }),
    onOpenDraft: (draftId: string) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            questId: null,
            activeDraftId: draftId,
        }),
    onOpenSharedDraft: (draftId: string) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            questId: null,
            activeDraftId: draftId,
        }),
    onOpenEdit: (recipeData: EditRecipeData) =>
        set({
            isOpen: true,
            isEditMode: true,
            editRecipeData: recipeData,
            questId: recipeData.questId ?? null,
            activeDraftId: null,
        }),
    onClose: () =>
        set({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            questId: null,
            activeDraftId: null,
        }),
}));

export default useRecipeModal;

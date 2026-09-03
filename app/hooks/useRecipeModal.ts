import { create } from 'zustand';
import { SafeRecipe, SafeUser } from '@/app/types';

export interface EditRecipeData {
    id: string;
    title: string;
    description: string;
    categories?: string[];
    method: string;
    imageSrc: string;
    imageSrc1?: string;
    imageSrc2?: string;
    imageSrc3?: string;
    ingredients: string[];
    steps: string[];
    minutes: number;
    prepTime?: number | null;
    cookTime?: number | null;
    coCooksIds?: string[];
    linkedRecipeIds?: string[];
    coCooks?: SafeUser[];
    linkedRecipes?: SafeRecipe[];
    youtubeUrl?: string;
    questId?: string;
}

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

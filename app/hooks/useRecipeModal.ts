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
    coCooksIds?: string[];
    linkedRecipeIds?: string[];
    coCooks?: SafeUser[];
    linkedRecipes?: SafeRecipe[];
    youtubeUrl?: string;
    questId?: string;
}

interface RecipeModalStore {
    isOpen: boolean;
    isEditMode: boolean;
    editRecipeData: EditRecipeData | null;
    questId: string | null;
    onOpen: () => void;
    onOpenCreate: (questId?: string) => void;
    onOpenEdit: (recipeData: EditRecipeData) => void;
    onClose: () => void;
}

const useRecipeModal = create<RecipeModalStore>((set) => ({
    isOpen: false,
    isEditMode: false,
    editRecipeData: null,
    questId: null,
    onOpen: () =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            questId: null,
        }),
    onOpenCreate: (questId?: string) =>
        set({
            isOpen: true,
            isEditMode: false,
            editRecipeData: null,
            questId: questId || null,
        }),
    onOpenEdit: (recipeData: EditRecipeData) =>
        set({
            isOpen: true,
            isEditMode: true,
            editRecipeData: recipeData,
            questId: null,
        }),
    onClose: () =>
        set({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
            questId: null,
        }),
}));

export default useRecipeModal;

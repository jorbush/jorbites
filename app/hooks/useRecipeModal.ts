import { create } from 'zustand';
import { SafeRecipe, SafeUser } from '@/app/types';

export interface EditRecipeData {
    id: string;
    title: string;
    description: string;
    category: string;
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
}

interface RecipeModalStore {
    isOpen: boolean;
    isEditMode: boolean;
    editRecipeData: EditRecipeData | null;
    onOpen: () => void;
    onOpenCreate: () => void;
    onOpenEdit: (recipeData: EditRecipeData) => void;
    onClose: () => void;
}

const useRecipeModal = create<RecipeModalStore>((set) => ({
    isOpen: false,
    isEditMode: false,
    editRecipeData: null,
    onOpen: () =>
        set({ isOpen: true, isEditMode: false, editRecipeData: null }),
    onOpenCreate: () =>
        set({ isOpen: true, isEditMode: false, editRecipeData: null }),
    onOpenEdit: (recipeData: EditRecipeData) =>
        set({
            isOpen: true,
            isEditMode: true,
            editRecipeData: recipeData,
        }),
    onClose: () =>
        set({
            isOpen: false,
            isEditMode: false,
            editRecipeData: null,
        }),
}));

export default useRecipeModal;

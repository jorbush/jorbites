import type { SafeRecipe, SafeUser } from '@/app/types';

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

export interface RecipeModalDraftController {
    isOpen?: boolean;
    isEditMode?: boolean;
    activeDraftId?: string | null;
    onOpenSharedDraft: (draftId: string) => void;
    onClose?: () => void;
}

export interface RecipeModalStateLike extends RecipeModalDraftController {
    isEditMode?: boolean;
    onClose?: () => void;
    editRecipeData?: EditRecipeData | null;
    questId?: string | null;
}

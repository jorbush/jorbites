import { SafeUser, SafeRecipe } from '@/app/types';

export interface SharedDraft {
    draftId: string;
    inviteToken?: string;
    ownerId: string;
    ownerName: string;
    coCooksIds: string[];
    title?: string;
    description?: string;
    categories?: string[];
    method?: string;
    imageSrc?: string;
    imageSrc1?: string;
    imageSrc2?: string;
    imageSrc3?: string;
    ingredients?: string[];
    steps?: string[];
    minutes?: number;
    prepTime?: number | null;
    cookTime?: number | null;
    linkedRecipeIds?: string[];
    youtubeUrl?: string | null;
    questId?: string | null;
    currentStep?: number;
    updatedAt: string;
    coCooks?: SafeUser[];
    linkedRecipes?: SafeRecipe[];
}

export interface SingleDraft {
    currentStep?: number;
    title?: string;
    description?: string;
    categories?: string[];
    method?: string;
    imageSrc?: string;
    imageSrc1?: string;
    imageSrc2?: string;
    imageSrc3?: string;
    ingredients?: string[];
    steps?: string[];
    minutes?: number;
    prepTime?: number | null;
    cookTime?: number | null;
    coCooksIds?: string[];
    linkedRecipeIds?: string[];
    youtubeUrl?: string | null;
    questId?: string | null;
    draftId?: string;
    inviteToken?: string;
    [key: string]: any;
}

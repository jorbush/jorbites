import { SafeUser, SafeRecipe } from '@/app/types';

export interface SharedDraft {
    draftId: string;
    type?: 'solo' | 'shared';
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
    createdAt?: string;
    updatedAt?: string;
    type?: 'solo' | 'shared';
    ownerId?: string;
    ownerName?: string;
    coCooks?: SafeUser[];
    linkedRecipes?: SafeRecipe[];
}

/** Lightweight draft view for card rendering in DraftsModal */
export interface DraftSummary {
    draftId: string;
    type: 'solo' | 'shared';
    title?: string;
    description?: string;
    categories?: string[];
    ingredients?: string[];
    steps?: string[];
    method?: string;
    coCooksIds: string[];
    ownerId: string;
    ownerName?: string;
    updatedAt: string;
    imageSrc?: string;
}

/** TTL information for draft display */
export interface DraftTTLInfo {
    /** Human-readable label fallback e.g. "Expires in 5 days" */
    label: string;
    /** True when TTL < 24 hours */
    isExpiringSoon: boolean;
    /** Remaining time in seconds */
    remainingSeconds: number;
    /** Translation key for i18n pluralization */
    key?: string;
    /** Count value for i18n pluralization */
    count?: number;
}

/** Step completion progress for a draft */
export interface DraftProgress {
    /** Number of steps with content */
    completedSteps: number;
    /** Total number of wizard steps (7) */
    totalSteps: number;
    /** Completion percentage 0-100 */
    percentage: number;
    /** Per-step completion status */
    stepDetails: { step: number; name: string; completed: boolean }[];
}

/** Union type representing either a solo or shared draft record */
export type DraftData = SingleDraft | SharedDraft;

/** Payload sent to draft create and update API endpoints */
export interface SaveDraftPayload {
    draftId?: string;
    inviteToken?: string;
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
    updatedAt?: string;
    type?: 'solo' | 'shared';
    ownerId?: string;
    ownerName?: string;
}

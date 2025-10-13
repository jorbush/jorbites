import {
    Recipe,
    User,
    Comment,
    Workshop,
    WorkshopParticipant,
} from '@prisma/client';

export type SafeRecipe = Omit<Recipe, 'createdAt'> & {
    createdAt: string;
};

export type SafeComment = Omit<Comment, 'createdAt'> & {
    createdAt: string;
    user: SafeUser;
};

export type SafeUser = Omit<
    User,
    'createdAt' | 'updatedAt' | 'emailVerified'
> & {
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
    recipeCount?: number | null | undefined;
    likesReceived?: number | null | undefined;
    recipesThisYear?: number | null | undefined;
    totalCookingTime?: number | null | undefined;
    avgLikesPerRecipe?: number | null | undefined;
    mostUsedCategory?: string | null | undefined;
    mostUsedMethod?: string | null | undefined;
};

export type SafeWorkshop = Omit<
    Workshop,
    'date' | 'createdAt' | 'updatedAt'
> & {
    date: string;
    createdAt: string;
    updatedAt: string;
    host?: SafeUser;
    participants?: SafeWorkshopParticipant[];
};

export type SafeWorkshopParticipant = Omit<WorkshopParticipant, 'joinedAt'> & {
    joinedAt: string;
};

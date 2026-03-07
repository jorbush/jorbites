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
    | 'createdAt'
    | 'updatedAt'
    | 'emailVerified'
    | 'hashedPassword'
    | 'resetToken'
    | 'resetTokenExpiry'
    | 'email'
    | 'emailNotifications'
    | 'favoriteIds'
> & {
    createdAt: string;
    updatedAt: string;
    email?: string | null;
    emailVerified?: string | null;
    favoriteIds?: string[];
    emailNotifications?: boolean;
    recipeCount?: number | null | undefined;
    likesReceived?: number | null | undefined;
    recipesThisYear?: number | null | undefined;
    recipesThisMonth?: number | null | undefined;
    totalCookingTime?: number | null | undefined;
    avgLikesPerRecipe?: number | null | undefined;
    mostUsedCategory?: string | null | undefined;
    mostUsedMethod?: string | null | undefined;
    badges?: string[];
    language?: string | null;
};

export type SafeWorkshop = Omit<
    Workshop,
    'date' | 'createdAt' | 'updatedAt'
> & {
    date: string;
    createdAt: string;
    updatedAt: string;
    currency?: string;
    host?: SafeUser;
    participants?: SafeWorkshopParticipant[];
};

export type SafeWorkshopParticipant = Omit<WorkshopParticipant, 'joinedAt'> & {
    joinedAt: string;
};

import {
    Recipe,
    User,
    Comment,
    Workshop,
    WorkshopParticipant,
    List,
} from '@prisma/client';

export type SafeRecipe = Omit<Recipe, 'createdAt'> & {
    createdAt: string;
};

export type CommentAuthor = Pick<
    SafeUser,
    'id' | 'name' | 'image' | 'verified' | 'level' | 'badges'
>;

export type SafeComment = Omit<Comment, 'createdAt'> & {
    createdAt: string;
    user: CommentAuthor;
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
    | 'favoriteIds'
    | 'emailNotifications'
    | 'language'
> & {
    createdAt?: string;
    updatedAt?: string;
    emailVerified?: string | null;
    email?: string | null;
    favoriteIds?: string[];
    emailNotifications?: boolean;
    language?: string | null;
    recipeCount?: number | null | undefined;
    likesReceived?: number | null | undefined;
    recipesThisYear?: number | null | undefined;
    recipesThisMonth?: number | null | undefined;
    totalCookingTime?: number | null | undefined;
    avgLikesPerRecipe?: number | null | undefined;
    mostUsedCategory?: string | null | undefined;
    mostUsedMethod?: string | null | undefined;
    badges?: string[];
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

export type SafeList = Omit<List, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
};

import { Recipe, User, Comment } from '@prisma/client';

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
};

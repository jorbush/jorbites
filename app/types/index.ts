import {
    Recipe,
    User,
    Comment,
    Workshop,
    WorkshopParticipant,
    List,
    WeeklyChallenge,
    Planning,
    PlanningMeal,
} from '@prisma/client';

export type SafeWeeklyChallenge = Omit<
    WeeklyChallenge,
    'startDate' | 'endDate' | 'createdAt' | 'updatedAt'
> & {
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
};

export type SafeRecipe = Omit<
    Recipe,
    | 'createdAt'
    | 'coCooksIds'
    | 'linkedRecipeIds'
    | 'listIds'
    | 'youtubeUrl'
    | 'questId'
    | 'averageRating'
    | 'ratingCount'
    | 'calories'
    | 'recipeCuisine'
> & {
    createdAt: string;
    coCooksIds?: string[];
    linkedRecipeIds?: string[];
    listIds?: string[];
    youtubeUrl?: string | null;
    questId?: string | null;
    averageRating?: number;
    ratingCount?: number;
    calories?: number | null;
    recipeCuisine?: string | null;
};

export type CommentAuthor = Pick<
    SafeUser,
    'id' | 'name' | 'image' | 'verified' | 'level' | 'badges'
>;

export type SafeComment = Omit<Comment, 'createdAt'> & {
    createdAt: string;
    user: CommentAuthor;
    rating?: number | null;
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
    | 'savedPlanningIds'
    | 'pinnedRecipeIds'
    | 'emailNotifications'
    | 'language'
> & {
    createdAt?: string;
    updatedAt?: string;
    emailVerified?: string | null;
    email?: string | null;
    favoriteIds?: string[];
    savedPlanningIds?: string[];
    pinnedRecipeIds?: string[];
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
    user?: SafeUser;
};

export type SafePlanningMeal = Omit<PlanningMeal, 'id' | 'planningId'> & {
    id: string;
    planningId: string;
    recipe?: SafeRecipe & { user?: SafeUser };
};

export type SafePlanning = Omit<Planning, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
    user?: SafeUser;
    meals?: SafePlanningMeal[];
};

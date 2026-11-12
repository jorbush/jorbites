import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { getActiveSession, getSessionDetails } from '@/app/lib/top-recipe-vote';

export type TopRecipeCategory = 'week' | 'month' | 'year';

export interface TopRecipeVoteData {
    session: any | null;
    userVote?: {
        recipeId: string;
    } | null;
}

export type TopRecipeSessionsMap = Record<
    TopRecipeCategory,
    TopRecipeVoteData | null
>;

const EMPTY_SESSIONS: TopRecipeSessionsMap = {
    week: null,
    month: null,
    year: null,
};

async function getTopRecipeSessionForCategory(
    category: TopRecipeCategory,
    userId?: string
): Promise<TopRecipeVoteData> {
    const session = await getActiveSession(category);
    if (!session) {
        return { session: null };
    }

    const [enrichedSession, userVote] = await Promise.all([
        getSessionDetails(session),
        userId
            ? prisma.recipeVote.findUnique({
                  where: {
                      category_periodKey_userId: {
                          category: session.category,
                          periodKey: session.periodKey,
                          userId,
                      },
                  },
                  select: {
                      recipeId: true,
                  },
              })
            : Promise.resolve(null),
    ]);

    return JSON.parse(
        JSON.stringify({
            session: enrichedSession,
            userVote,
        })
    );
}

/**
 * Fetches active/latest top recipe vote sessions for week, month, and year on the server
 * to avoid client-side layout shift on the events page.
 */
export async function getTopRecipeSessions(): Promise<TopRecipeSessionsMap> {
    try {
        const currentUser = await getCurrentUser();
        const userId = currentUser?.id;

        const [week, month, year] = await Promise.all([
            getTopRecipeSessionForCategory('week', userId),
            getTopRecipeSessionForCategory('month', userId),
            getTopRecipeSessionForCategory('year', userId),
        ]);

        return { week, month, year };
    } catch {
        return EMPTY_SESSIONS;
    }
}

import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { logger } from '@/app/lib/axiom/server';
import {
    internalServerError,
    unauthorizedResponse,
    badRequest,
} from '@/app/utils/apiErrors';
import {
    getActiveSession,
    getSessionDetails,
    openVoteSession,
    closeVoteSession,
    castVote,
} from '@/app/lib/top-recipe-vote';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        if (!category || !['week', 'month', 'year'].includes(category)) {
            return badRequest('Invalid or missing category parameter');
        }

        logger.info('api/top-recipe-vote GET - start', { category });

        const session = await getActiveSession(category);

        if (!session) {
            logger.info('api/top-recipe-vote GET - no session found', {
                category,
            });
            return NextResponse.json({ session: null });
        }

        const enrichedSession = await getSessionDetails(session);
        const currentUser = await getCurrentUser();
        let userVote = null;

        if (currentUser) {
            userVote = await prisma.recipeVote.findUnique({
                where: {
                    category_periodKey_userId: {
                        category: session.category,
                        periodKey: session.periodKey,
                        userId: currentUser.id,
                    },
                },
            });
        }

        logger.info('api/top-recipe-vote GET - success', {
            category,
            sessionId: session.id,
            hasUserVote: !!userVote,
        });

        return NextResponse.json({ session: enrichedSession, userVote });
    } catch (error: any) {
        logger.error('api/top-recipe-vote GET - error', {
            error: error.message,
        });
        return internalServerError('Failed to fetch top recipe vote session');
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (authHeader) {
            // Cron trigger authentication
            const cronSecret = process.env.CRON_SECRET;
            if (!cronSecret) {
                logger.error(
                    'api/top-recipe-vote POST - CRON_SECRET not configured'
                );
                return internalServerError('CRON_SECRET not configured');
            }

            const [scheme, token] = authHeader.trim().split(/\s+/);
            if (scheme.toLowerCase() !== 'bearer' || token !== cronSecret) {
                logger.error(
                    'api/top-recipe-vote POST - invalid token or scheme'
                );
                return unauthorizedResponse('Invalid token or scheme');
            }

            const body = await request.json();
            const { action, category } = body;

            if (!action || !category) {
                return badRequest('Action and category are required');
            }

            if (!['week', 'month', 'year'].includes(category)) {
                return badRequest('Invalid category');
            }

            logger.info('api/top-recipe-vote POST (cron) - start', {
                action,
                category,
            });

            if (action === 'open') {
                const session = await openVoteSession(category);
                if (!session) {
                    return NextResponse.json({
                        status: 'skipped',
                        reason: 'Not enough candidates (minimum 4 required)',
                    });
                }
                return NextResponse.json({ status: 'success', session });
            } else if (action === 'close') {
                const session = await closeVoteSession(category);
                if (!session) {
                    return NextResponse.json({
                        status: 'skipped',
                        reason: 'No session found to close',
                    });
                }
                return NextResponse.json({ status: 'success', session });
            } else {
                return badRequest('Invalid action');
            }
        } else {
            // Logged in user casting/changing vote
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                return unauthorizedResponse(
                    'User authentication required to vote'
                );
            }

            const body = await request.json();
            const { sessionId, recipeId } = body;

            if (!sessionId || !recipeId) {
                return badRequest('Session ID and recipe ID are required');
            }

            logger.info('api/top-recipe-vote POST (user) - start', {
                sessionId,
                recipeId,
                userId: currentUser.id,
            });

            const vote = await castVote(currentUser.id, sessionId, recipeId);
            return NextResponse.json({ status: 'success', vote });
        }
    } catch (error: any) {
        logger.error('api/top-recipe-vote POST - error', {
            error: error.message,
        });
        return internalServerError(
            error.message || 'Failed to process request'
        );
    }
}

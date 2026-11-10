import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListsAndPlanningsByRecipeId from '@/app/actions/getListsAndPlanningsByRecipeId';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    id?: string;
}

export async function GET(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const [params, currentUser] = await Promise.all([
            props.params,
            getCurrentUser(),
        ]);

        const { id: recipeId } = params;

        if (!recipeId || typeof recipeId !== 'string') {
            return badRequest('Invalid recipe ID');
        }

        logger.info('GET /api/recipes/[id]/lists-and-plannings - start', {
            recipeId,
            userId: currentUser?.id,
        });

        const data = await getListsAndPlanningsByRecipeId({
            recipeId,
            userId: currentUser?.id,
        });

        return NextResponse.json(data);
    } catch (error: any) {
        logger.error('GET /api/recipes/[id]/lists-and-plannings - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}

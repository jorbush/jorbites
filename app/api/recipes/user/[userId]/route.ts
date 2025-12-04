import { NextResponse } from 'next/server';

import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import { OrderByType } from '@/app/utils/filter';

interface IParams {
    userId?: string;
}

export async function GET(
    request: Request,
    { params }: { params: IParams },
) {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page')
        ? parseInt(searchParams.get('page') as string)
        : 1;
    const limit = searchParams.get('limit')
        ? parseInt(searchParams.get('limit') as string)
        : 12;
    const orderBy = searchParams.get('orderBy') as OrderByType;

    if (!userId) {
        return NextResponse.error();
    }

    const recipes = await getRecipesByUserId({
        userId,
        page,
        limit,
        orderBy,
    });
    return NextResponse.json(recipes);
}

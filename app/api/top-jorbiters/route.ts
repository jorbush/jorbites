import { NextResponse } from 'next/server';
import getTopJorbiters, { Timeframe } from '@/app/actions/getTopJorbiters';
import { logger } from '@/app/lib/axiom/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const timeframeParam = searchParams.get('timeframe');
        const timeframe: Timeframe =
            timeframeParam === 'week' || timeframeParam === 'month'
                ? timeframeParam
                : 'all';

        const topJorbiters = await getTopJorbiters(timeframe);

        if (!topJorbiters) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(topJorbiters);
    } catch (error: any) {
        logger.error('API getTopJorbiters error', { error: error.message });
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

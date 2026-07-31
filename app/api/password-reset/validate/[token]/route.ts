import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/app/lib/prismadb';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    token?: string;
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const { token } = params;

        logger.info('POST /api/password-reset/validate/[token] - start', {
            hasToken: !!token,
        });

        if (!token) {
            return badRequest('Token is required');
        }

        const hashedResetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetToken: hashedResetToken,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            logger.info(
                'POST /api/password-reset/validate/[token] - invalid token'
            );
            return NextResponse.json({ valid: false });
        }

        logger.info('POST /api/password-reset/validate/[token] - valid token');
        return NextResponse.json({ valid: true });
    } catch (error: any) {
        logger.error('POST /api/password-reset/validate/[token] - error', {
            error: error.message,
        });
        return internalServerError('Failed to validate token');
    }
}

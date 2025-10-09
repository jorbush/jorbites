import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';
import { logger, withAxiom } from '@/app/lib/axiom/server';

interface IParams {
    token?: string;
}

export const GET = withAxiom(
    async (request: NextRequest, props: { params: Promise<IParams> }) => {
        try {
            logger.info('GET /api/password-reset/validate/[token] - start');
            const params = await props.params;
            const { token } = params;

            if (!token) {
                return badRequest('Token is required');
            }

            const user = await prisma.user.findFirst({
                where: {
                    resetToken: token,
                    resetTokenExpiry: {
                        gt: new Date(),
                    },
                },
            });

            if (!user) {
                logger.info(
                    'GET /api/password-reset/validate/[token] - invalid token',
                    { token }
                );
                return NextResponse.json({ valid: false });
            }

            logger.info(
                'GET /api/password-reset/validate/[token] - valid token',
                { token }
            );
            return NextResponse.json({ valid: true });
        } catch (error: any) {
            logger.error('GET /api/password-reset/validate/[token] - error', {
                error: error.message,
            });
            return internalServerError('Failed to validate token');
        }
    }
);

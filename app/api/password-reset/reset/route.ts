import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/app/lib/prismadb';
import bcrypt from 'bcrypt';
import {
    badRequest,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { passwordResetRatelimit } from '@/app/lib/ratelimit';

export async function POST(request: Request) {
    try {
        // Rate limiting for password reset - prevent brute force token guessing
        if (process.env.ENV === 'production') {
            const hdrs = await headers();
            const ip =
                hdrs.get('x-real-ip')?.trim() ||
                hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                'unknown-ip';
            const { success, reset } = await passwordResetRatelimit.limit(ip);
            if (!success) {
                const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
                const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
                logger.warn(
                    'POST /api/password-reset/reset - rate limit exceeded',
                    { ip }
                );
                return rateLimitExceeded(
                    `Too many password reset attempts. Please try again in ${retryAfterMinutes} minutes.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();
        const { token, password } = body;

        logger.info('POST /api/password-reset/reset - start', {
            hasToken: !!token,
        });

        if (!token || !password) {
            return badRequest('Token and password are required');
        }

        if (password.length < 6) {
            return badRequest('Password must be at least 6 characters long');
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
            return badRequest('Invalid or expired token');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        logger.info('POST /api/password-reset/reset - success', {
            userId: user.id,
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error('POST /api/password-reset/reset - error', {
            error: error.message,
        });
        return internalServerError('Failed to reset password');
    }
}

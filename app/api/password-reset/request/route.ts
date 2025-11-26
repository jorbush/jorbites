import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { headers } from 'next/headers';
import prisma from '@/app/lib/prismadb';
import { JORBITES_URL } from '@/app/utils/constants';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';
import {
    badRequest,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { passwordResetRatelimit } from '@/app/lib/ratelimit';

export async function POST(request: Request) {
    try {
        // Rate limiting for password reset - prevent email bombing
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
                    'POST /api/password-reset/request - rate limit exceeded',
                    { ip }
                );
                return rateLimitExceeded(
                    `Too many password reset attempts. Please try again in ${retryAfterMinutes} minutes.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();
        const { email } = body;

        logger.info('POST /api/password-reset/request - start', { email });

        if (!email) {
            return badRequest('Email is required');
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        const resetUrl = `${JORBITES_URL}/reset-password/${resetToken}`;

        await sendEmail({
            type: EmailType.FORGOT_PASSWORD,
            userEmail: user.email,
            params: {
                resetUrl: resetUrl,
            },
        });

        logger.info('POST /api/password-reset/request - success', { email });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error('POST /api/password-reset/request - error', {
            error: error.message,
        });
        return internalServerError('Failed to process password reset request');
    }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import {
    unauthorizedResponse,
    badRequest,
    rateLimitExceeded,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { twoFactorRatelimit } from '@/app/lib/ratelimit';
import {
    generateTotpSecret,
    buildOtpAuthUrl,
    encryptTotpSecret,
} from '@/app/utils/totp';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to set up 2FA'
            );
        }

        if (process.env.ENV === 'production') {
            const { success, reset } = await twoFactorRatelimit.limit(
                currentUser.id
            );
            if (!success) {
                const retryAfterSeconds = Math.max(
                    0,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                return rateLimitExceeded(
                    'Too many 2FA requests. Please try again later.',
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json().catch(() => ({}));
        const { currentPassword } = body;

        if (!currentPassword || typeof currentPassword !== 'string') {
            return badRequest('Current password is required');
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
        });

        if (!user || !user.hashedPassword) {
            return badRequest(
                'A password must be set on your account before enabling 2FA'
            );
        }

        if (user.twoFactorEnabled) {
            return badRequest('Two-factor authentication is already enabled');
        }

        const isCorrectPassword = await bcrypt.compare(
            currentPassword,
            user.hashedPassword
        );

        if (!isCorrectPassword) {
            return badRequest('Current password is incorrect');
        }

        const secret = generateTotpSecret();
        const encryptedSecret = encryptTotpSecret(secret);
        const otpauthUrl = buildOtpAuthUrl({
            secret,
            email: user.email || user.name || user.id,
        });

        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                twoFactorSecret: encryptedSecret,
                twoFactorEnabled: false,
            },
        });

        logger.info('POST /api/2fa/setup - success', {
            userId: currentUser.id,
        });

        return NextResponse.json({
            secret,
            otpauthUrl,
        });
    } catch (error: any) {
        logger.error('POST /api/2fa/setup - error', {
            error: error.message,
        });
        return internalServerError(
            'Failed to set up two-factor authentication'
        );
    }
}

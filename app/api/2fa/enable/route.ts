import { NextResponse } from 'next/server';
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
    decryptTotpSecret,
    verifyTotpCode,
    generateBackupCodes,
} from '@/app/utils/totp';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to enable 2FA'
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
                    'Too many 2FA verification attempts. Please try again later.',
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json().catch(() => ({}));
        const { code } = body;

        if (!code || typeof code !== 'string') {
            return badRequest('Verification code is required');
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
        });

        if (!user || !user.twoFactorSecret) {
            return badRequest(
                '2FA setup has not been initiated. Please start setup first.'
            );
        }

        if (user.twoFactorEnabled) {
            return badRequest('Two-factor authentication is already enabled');
        }

        const secret = decryptTotpSecret(user.twoFactorSecret);
        const isValid = verifyTotpCode(code, secret);

        if (!isValid) {
            return badRequest('Invalid verification code');
        }

        const { rawCodes, hashedCodes } = generateBackupCodes(8);

        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                twoFactorEnabled: true,
                twoFactorBackupCodes: hashedCodes,
            },
        });

        logger.info('POST /api/2fa/enable - success', {
            userId: currentUser.id,
        });

        return NextResponse.json({
            success: true,
            backupCodes: rawCodes,
        });
    } catch (error: any) {
        logger.error('POST /api/2fa/enable - error', {
            error: error.message,
        });
        return internalServerError(
            'Failed to enable two-factor authentication'
        );
    }
}

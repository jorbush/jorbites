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
import { generateBackupCodes } from '@/app/utils/totp';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to regenerate backup codes'
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
            return badRequest('User not found or no password set');
        }

        if (!user.twoFactorEnabled) {
            return badRequest('Two-factor authentication is not enabled');
        }

        const isCorrectPassword = await bcrypt.compare(
            currentPassword,
            user.hashedPassword
        );

        if (!isCorrectPassword) {
            return badRequest('Current password is incorrect');
        }

        const { rawCodes, hashedCodes } = generateBackupCodes(8);

        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                twoFactorBackupCodes: hashedCodes,
            },
        });

        logger.info('POST /api/2fa/backup-codes - success', {
            userId: currentUser.id,
        });

        return NextResponse.json({
            success: true,
            backupCodes: rawCodes,
        });
    } catch (error: any) {
        logger.error('POST /api/2fa/backup-codes - error', {
            error: error.message,
        });
        return internalServerError('Failed to regenerate backup codes');
    }
}

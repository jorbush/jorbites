import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/app/lib/prismadb';
import { JORBITES_URL } from '@/app/utils/constants';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';
import { logger, withAxiom } from '@/app/lib/axiom/server';

export const POST = withAxiom(async (request: Request) => {
    try {
        logger.info('POST /api/password-reset/request - start');
        const body = await request.json();
        const { email } = body;

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
});

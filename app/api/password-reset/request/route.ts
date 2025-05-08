import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/app/libs/prismadb';
import { JORBITES_URL } from '@/app/utils/constants';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in reset request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

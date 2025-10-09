import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import bcrypt from 'bcrypt';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password } = body;

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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error resetting password:', error);
        return internalServerError('Failed to reset password');
    }
}

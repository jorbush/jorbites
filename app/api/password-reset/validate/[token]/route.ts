import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export async function GET(
    request: Request,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = params;

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 400 });
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
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error('Error validating token:', error);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}

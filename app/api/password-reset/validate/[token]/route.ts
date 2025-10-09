import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';

interface IParams {
    token?: string;
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<IParams> }
) {
    try {
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
            return NextResponse.json({ valid: false });
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error('Error validating token:', error);
        return internalServerError('Failed to validate token');
    }
}

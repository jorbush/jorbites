import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import prisma from '@/app/lib/prismadb';
import {
    badRequest,
    conflict,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password } = body;

        logger.info('POST /api/register - start', { email });

        if (!email || !name || !password) {
            return badRequest('Email, name, and password are required');
        }

        if (password.length < 6) {
            return badRequest('Password must be at least 6 characters long');
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return conflict('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
            },
        });

        logger.info('POST /api/register - success', { userId: user.id, email });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('POST /api/register - error', { error: error.message });
        return internalServerError('Failed to create user account');
    }
}

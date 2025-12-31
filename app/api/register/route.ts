import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { headers } from 'next/headers';

import prisma from '@/app/lib/prismadb';
import {
    badRequest,
    conflict,
    internalServerError,
    rateLimitExceeded,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';
import { registrationRatelimit } from '@/app/lib/ratelimit';

export async function POST(request: Request) {
    try {
        // Rate limiting for registration - prevent mass account creation
        if (process.env.ENV === 'production') {
            const hdrs = await headers();
            const ip =
                hdrs.get('x-real-ip')?.trim() ||
                hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                'unknown-ip';
            const { success, reset } = await registrationRatelimit.limit(ip);
            if (!success) {
                const retryAfterSeconds = Math.max(
                    0,
                    Math.ceil((reset - Date.now()) / 1000)
                );
                const retryAfterMinutes = Math.max(
                    1,
                    Math.ceil(retryAfterSeconds / 60)
                );
                logger.warn('POST /api/register - rate limit exceeded', { ip });
                return rateLimitExceeded(
                    `Too many registration attempts. Please try again in ${retryAfterMinutes} minutes.`,
                    retryAfterSeconds
                );
            }
        }

        const body = await request.json();
        const { email, name, password } = body;

        logger.info('POST /api/register - start', { email });

        // Normalize email to lowercase for consistency
        const normalizedEmail = email?.toLowerCase();

        if (!email || !name || !password) {
            return badRequest('Email, name, and password are required');
        }

        if (password.length < 6) {
            return badRequest('Password must be at least 6 characters long');
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: 'insensitive',
                },
            },
        });

        if (existingUser) {
            return conflict('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name,
                hashedPassword,
            },
        });

        logger.info('POST /api/register - success', {
            userId: user.id,
            email: normalizedEmail,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('POST /api/register - error', { error: error.message });
        return internalServerError('Failed to create user account');
    }
}

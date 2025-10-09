import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/lib/prismadb';
import { USERNAME_MAX_LENGTH } from '@/app/utils/constants';
import {
    unauthorized,
    badRequest,
    conflict,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger, withAxiom } from '@/app/lib/axiom/server';

export const PATCH = withAxiom(async (request: Request) => {
    try {
        logger.info('PATCH /api/userName/[userId] - start');
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to update username'
            );
        }

        const body = await request.json();
        const { userName } = body;

        if (!userName || typeof userName !== 'string') {
            return badRequest('Valid username is required');
        }

        // Validate username requirements
        const trimmedUserName = userName.trim();

        if (trimmedUserName.length === 0) {
            return badRequest('Username cannot be empty');
        }

        if (trimmedUserName.length > USERNAME_MAX_LENGTH) {
            return badRequest(
                `Username must be ${USERNAME_MAX_LENGTH} characters or less`
            );
        }

        // Check that username contains only alphanumeric characters and underscores
        if (!/^[a-zA-Z0-9_]+$/.test(trimmedUserName)) {
            return badRequest(
                'Username must contain only letters, numbers, and underscores'
            );
        }

        // Check if username is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                name: trimmedUserName,
                id: {
                    not: currentUser.id, // Exclude current user
                },
            },
        });

        if (existingUser) {
            return conflict('Username is already taken');
        }

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                name: trimmedUserName,
            },
        });

        logger.info('PATCH /api/userName/[userId] - success', {
            userId: user.id,
            newUserName: trimmedUserName,
        });
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error('PATCH /api/userName/[userId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to update username');
    }
});

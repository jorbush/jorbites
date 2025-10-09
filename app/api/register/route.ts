import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import prisma from '@/app/lib/prismadb';
import {
    badRequest,
    conflict,
    internalServerError,
} from '@/app/utils/apiErrors';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password } = body;

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

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return internalServerError('Failed to create user account');
    }
}

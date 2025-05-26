import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import prisma from '@/app/libs/prismadb';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email) {
        return NextResponse.json(
            { error: "Missing required field: email" },
            { status: 400 }
        );
    }

    if (!name) {
        return NextResponse.json(
            { error: "Missing required field: name" },
            { status: 400 }
        );
    }

    if (!password) {
        return NextResponse.json(
            { error: "Missing required field: password" },
            { status: 400 }
        );
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        return NextResponse.json(
            { error: 'Email already exists' },
            { status: 409 }
        );
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
}

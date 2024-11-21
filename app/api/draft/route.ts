import { NextResponse } from 'next/server';
import { redis } from "@/app/libs/redis";
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.error();
    }
    const body = await request.json();
    await redis.set(currentUser.id, JSON.stringify(body));
    return NextResponse.json(null);
}

export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.error();
    }
    const data = await redis.get(currentUser.id);
    return NextResponse.json(data ? JSON.parse(data) : null);
}

export async function DELETE() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.error();
    }
    const response = await redis.del(currentUser.id);
    return NextResponse.json(response);
}

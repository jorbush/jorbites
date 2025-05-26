import { NextResponse } from 'next/server';
import { redis } from '@/app/libs/redis';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { unauthorized, internalServerError } from '@/app/utils/apiErrors';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorized('User authentication required to save draft');
        }
        const body = await request.json();
        await redis.set(currentUser.id, JSON.stringify(body));
        return NextResponse.json(null);
    } catch (error) {
        console.error('Error saving draft:', error);
        return internalServerError('Failed to save draft');
    }
}

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorized('User authentication required to get draft');
        }
        const data = await redis.get(currentUser.id);
        return NextResponse.json(data ? JSON.parse(data) : null);
    } catch (error) {
        console.error('Error getting draft:', error);
        return internalServerError('Failed to retrieve draft');
    }
}

export async function DELETE() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorized('User authentication required to delete draft');
        }
        const response = await redis.del(currentUser.id);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error deleting draft:', error);
        return internalServerError('Failed to delete draft');
    }
}

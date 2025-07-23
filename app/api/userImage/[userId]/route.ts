import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { deleteFromCloudinary, isCloudinaryUrl } from '@/app/utils/cloudinary';
import {
    unauthorized,
    badRequest,
    internalServerError,
} from '@/app/utils/apiErrors';

export async function PUT(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to update profile image'
            );
        }

        const body = await request.json();
        const { userImage } = body;

        if (!userImage || typeof userImage !== 'string') {
            return badRequest('Valid user image URL is required');
        }

        const oldImage = currentUser.image;

        // Delete old image from Cloudinary if it's a Cloudinary URL and different from new image
        if (oldImage && oldImage !== userImage && isCloudinaryUrl(oldImage)) {
            try {
                const deleted = await deleteFromCloudinary(oldImage);
                if (deleted) {
                    console.log(
                        `Successfully deleted old profile image from Cloudinary for user ${currentUser.id}`
                    );
                } else {
                    console.warn(
                        `Failed to delete old profile image from Cloudinary for user ${currentUser.id}: ${oldImage}`
                    );
                }
            } catch (error) {
                console.error(
                    'Error deleting old profile image from Cloudinary:',
                    error
                );
            }
        }

        const user = await prisma.user.update({
            where: {
                id: currentUser.id,
            },
            data: {
                image: userImage,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user image:', error);
        return internalServerError('Failed to update user image');
    }
}

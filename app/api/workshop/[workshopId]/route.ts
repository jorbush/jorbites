import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { deleteMultipleFromCloudinary } from '@/app/utils/cloudinary';
import {
    unauthorized,
    invalidInput,
    badRequest,
    forbidden,
    notFound,
    internalServerError,
    validationError,
} from '@/app/utils/apiErrors';
import {
    WORKSHOP_TITLE_MAX_LENGTH,
    WORKSHOP_DESCRIPTION_MAX_LENGTH,
    WORKSHOP_LOCATION_MAX_LENGTH,
    WORKSHOP_INGREDIENT_MAX_LENGTH,
    WORKSHOP_STEP_MAX_LENGTH,
    WORKSHOP_MAX_INGREDIENTS,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    workshopId?: string;
}

export async function PATCH(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to edit workshop'
            );
        }

        const { workshopId } = params;

        logger.info('PATCH /api/workshop/[workshopId] - start', {
            workshopId,
            userId: currentUser.id,
        });

        if (!workshopId || typeof workshopId !== 'string') {
            return invalidInput(
                'Workshop ID is required and must be a valid string'
            );
        }

        const workshop = await prisma.workshop.findUnique({
            where: { id: workshopId },
        });

        if (!workshop) {
            return notFound('Workshop not found');
        }

        if (workshop.hostId !== currentUser.id) {
            return forbidden('You can only edit your own workshops');
        }

        const body = await request.json();
        const {
            title,
            description,
            date,
            location,
            isRecurrent,
            recurrencePattern,
            isPrivate,
            whitelistedUserIds,
            imageSrc,
            price,
            ingredients,
            previousSteps,
        } = body;

        // Validation
        if (!title || !description || !date || !location) {
            return badRequest(
                'Missing required fields: title, description, date, and location are required'
            );
        }

        if (title.length > WORKSHOP_TITLE_MAX_LENGTH) {
            return validationError(
                `Title must be ${WORKSHOP_TITLE_MAX_LENGTH} characters or less`
            );
        }

        if (description.length > WORKSHOP_DESCRIPTION_MAX_LENGTH) {
            return validationError(
                `Description must be ${WORKSHOP_DESCRIPTION_MAX_LENGTH} characters or less`
            );
        }

        if (location.length > WORKSHOP_LOCATION_MAX_LENGTH) {
            return validationError(
                `Location must be ${WORKSHOP_LOCATION_MAX_LENGTH} characters or less`
            );
        }

        if (ingredients && ingredients.length > WORKSHOP_MAX_INGREDIENTS) {
            return validationError(
                `Workshop cannot have more than ${WORKSHOP_MAX_INGREDIENTS} ingredients`
            );
        }

        if (previousSteps && previousSteps.length > WORKSHOP_MAX_STEPS) {
            return validationError(
                `Workshop cannot have more than ${WORKSHOP_MAX_STEPS} previous steps`
            );
        }

        if (ingredients) {
            for (const ingredient of ingredients) {
                if (ingredient.length > WORKSHOP_INGREDIENT_MAX_LENGTH) {
                    return validationError(
                        `Each ingredient must be ${WORKSHOP_INGREDIENT_MAX_LENGTH} characters or less`
                    );
                }
            }
        }

        if (previousSteps) {
            for (const step of previousSteps) {
                if (step.length > WORKSHOP_STEP_MAX_LENGTH) {
                    return validationError(
                        `Each step must be ${WORKSHOP_STEP_MAX_LENGTH} characters or less`
                    );
                }
            }
        }

        const workshopDate = new Date(date);
        if (workshopDate <= new Date()) {
            return validationError('Workshop date must be in the future');
        }

        if (price !== undefined && price !== null) {
            if (typeof price !== 'number' || price < 0) {
                return validationError('Price must be a non-negative number');
            }
        }

        // Handle image deletion if changed
        if (workshop.imageSrc && imageSrc && workshop.imageSrc !== imageSrc) {
            try {
                await deleteMultipleFromCloudinary([workshop.imageSrc]);
            } catch (error) {
                console.error('Error deleting old workshop image:', error);
            }
        }

        const updatedWorkshop = await prisma.workshop.update({
            where: { id: workshopId },
            data: {
                title,
                description,
                date: workshopDate,
                location,
                isRecurrent: isRecurrent || false,
                recurrencePattern: recurrencePattern || null,
                isPrivate: isPrivate || false,
                whitelistedUserIds: whitelistedUserIds || [],
                imageSrc: imageSrc || null,
                price: price || 0,
                ingredients: ingredients || [],
                previousSteps: previousSteps || [],
            },
        });

        logger.info('PATCH /api/workshop/[workshopId] - success', {
            workshopId,
        });
        return NextResponse.json(updatedWorkshop);
    } catch (error: any) {
        logger.error('PATCH /api/workshop/[workshopId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to update workshop');
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to delete workshop'
            );
        }

        const { workshopId } = params;

        logger.info('DELETE /api/workshop/[workshopId] - start', {
            workshopId,
            userId: currentUser.id,
        });

        if (!workshopId || typeof workshopId !== 'string') {
            return invalidInput(
                'Workshop ID is required and must be a valid string'
            );
        }

        const workshop = await prisma.workshop.findUnique({
            where: { id: workshopId },
        });

        if (!workshop) {
            return notFound('Workshop not found');
        }

        if (workshop.hostId !== currentUser.id) {
            return forbidden('You can only delete your own workshops');
        }

        // Delete workshop image from Cloudinary if exists
        if (workshop.imageSrc) {
            try {
                await deleteMultipleFromCloudinary([workshop.imageSrc]);
            } catch (error) {
                console.error('Error deleting workshop image:', error);
            }
        }

        const deletedWorkshop = await prisma.workshop.delete({
            where: { id: workshopId },
        });

        logger.info('DELETE /api/workshop/[workshopId] - success', {
            workshopId,
        });
        return NextResponse.json(deletedWorkshop);
    } catch (error: any) {
        logger.error('DELETE /api/workshop/[workshopId] - error', {
            error: error.message,
        });
        return internalServerError('Failed to delete workshop');
    }
}

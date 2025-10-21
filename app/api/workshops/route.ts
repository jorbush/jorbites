import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import sendEmail from '@/app/actions/sendEmail';
import { EmailType } from '@/app/types/email';
import {
    WORKSHOP_TITLE_MAX_LENGTH,
    WORKSHOP_DESCRIPTION_MAX_LENGTH,
    WORKSHOP_LOCATION_MAX_LENGTH,
    WORKSHOP_INGREDIENT_MAX_LENGTH,
    WORKSHOP_STEP_MAX_LENGTH,
    WORKSHOP_MAX_INGREDIENTS,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';
import {
    unauthorized,
    validationError,
    badRequest,
    internalServerError,
} from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to create workshop'
            );
        }

        const body = await request.json();

        logger.info('POST /api/workshops - start', { userId: currentUser.id });
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

        if (
            imageSrc === undefined ||
            imageSrc === null ||
            imageSrc.trim() === ''
        ) {
            return badRequest('Image source is required');
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

        // Validate date is in the future
        const workshopDate = new Date(date);
        if (workshopDate <= new Date()) {
            return validationError('Workshop date must be in the future');
        }

        // Validate price
        if (price !== undefined && price !== null) {
            if (typeof price !== 'number' || price < 0) {
                return validationError('Price must be a non-negative number');
            }
        }

        const workshop = await prisma.workshop.create({
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
                hostId: currentUser.id,
            },
        });

        // Send notifications to whitelisted users if workshop is private
        if (isPrivate && whitelistedUserIds && whitelistedUserIds.length > 0) {
            const whitelistedUsers = await prisma.user.findMany({
                where: {
                    id: { in: whitelistedUserIds },
                    emailNotifications: true,
                },
            });

            for (const user of whitelistedUsers) {
                await sendEmail({
                    type: EmailType.NEW_RECIPE, // TODO: Create WORKSHOP_INVITATION type
                    userEmail: user.email,
                    params: {
                        recipeId: workshop.id, // Use workshopId when email type is ready
                    },
                });
            }
        }

        logger.info('POST /api/workshops - success', {
            workshopId: workshop.id,
            userId: currentUser.id,
        });
        return NextResponse.json(workshop);
    } catch (error: any) {
        logger.error('POST /api/workshops - error', { error: error.message });
        console.error(error);
        return internalServerError('Failed to create workshop');
    }
}

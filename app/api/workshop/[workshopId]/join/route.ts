import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorized,
    invalidInput,
    badRequest,
    forbidden,
    notFound,
    internalServerError,
} from '@/app/utils/apiErrors';
import { WORKSHOP_MAX_PARTICIPANTS } from '@/app/utils/constants';
import { logger } from '@/app/lib/axiom/server';

interface IParams {
    workshopId?: string;
}

export async function POST(
    request: Request,
    props: { params: Promise<IParams> }
) {
    try {
        const params = await props.params;
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return unauthorized(
                'User authentication required to join workshop'
            );
        }

        const { workshopId } = params;
        const body = await request.json();
        const { action } = body; // 'join' or 'leave'

        logger.info('POST /api/workshop/[workshopId]/join - start', {
            workshopId,
            action,
            userId: currentUser.id,
        });

        if (!workshopId || typeof workshopId !== 'string') {
            return invalidInput(
                'Workshop ID is required and must be a valid string'
            );
        }

        if (!action || (action !== 'join' && action !== 'leave')) {
            return badRequest('Action must be either "join" or "leave"');
        }

        const workshop = await prisma.workshop.findUnique({
            where: { id: workshopId },
            include: {
                host: true,
                participants: true,
            },
        });

        if (!workshop) {
            return notFound('Workshop not found');
        }

        // Check if workshop is private and user is not whitelisted
        if (
            workshop.isPrivate &&
            !workshop.whitelistedUserIds.includes(currentUser.id) &&
            workshop.hostId !== currentUser.id
        ) {
            return forbidden(
                'This is a private workshop and you are not invited'
            );
        }

        // Check if workshop date has passed
        if (workshop.date < new Date()) {
            return badRequest('Cannot join a workshop that has already passed');
        }

        if (action === 'join') {
            // Check if already joined
            const existingParticipant =
                await prisma.workshopParticipant.findUnique({
                    where: {
                        workshopId_userId: {
                            workshopId: workshopId,
                            userId: currentUser.id,
                        },
                    },
                });

            if (existingParticipant) {
                return badRequest('You have already joined this workshop');
            }

            // Check participant limit
            if (workshop.participants.length >= WORKSHOP_MAX_PARTICIPANTS) {
                return badRequest('Workshop has reached maximum capacity');
            }

            // Create participant
            await prisma.workshopParticipant.create({
                data: {
                    workshopId: workshopId,
                    userId: currentUser.id,
                },
            });

            // Notify host if notifications enabled
            // if (workshop.host.emailNotifications) {
            //     await sendNotification({
            //         type: NotificationType.NEW_LIKE, // TODO: Create WORKSHOP_JOIN type
            //         userEmail: workshop.host.email,
            //         params: {
            //             userName: currentUser.name,
            //             recipeId: workshopId,
            //         },
            //     });
            // }

            logger.info('POST /api/workshop/[workshopId]/join - joined', {
                workshopId,
                userId: currentUser.id,
            });
            return NextResponse.json({
                message: 'Successfully joined workshop',
            });
        } else {
            // Leave workshop
            const participant = await prisma.workshopParticipant.findUnique({
                where: {
                    workshopId_userId: {
                        workshopId: workshopId,
                        userId: currentUser.id,
                    },
                },
            });

            if (!participant) {
                return badRequest('You are not a participant of this workshop');
            }

            await prisma.workshopParticipant.delete({
                where: {
                    workshopId_userId: {
                        workshopId: workshopId,
                        userId: currentUser.id,
                    },
                },
            });

            logger.info('POST /api/workshop/[workshopId]/join - left', {
                workshopId,
                userId: currentUser.id,
            });
            return NextResponse.json({ message: 'Successfully left workshop' });
        }
    } catch (error: any) {
        logger.error('POST /api/workshop/[workshopId]/join - error', {
            error: error.message,
        });
        return internalServerError('Failed to process workshop participation');
    }
}

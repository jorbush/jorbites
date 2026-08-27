import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import {
    unauthorizedResponse,
    forbiddenResponse,
    internalServerError,
} from '@/app/utils/apiErrors';
import { STEPS_LENGTH } from '@/app/utils/constants';
import { logger } from '@/app/lib/axiom/server';
import { DraftService } from '@/app/services/draftService';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to save draft'
            );
        }
        const body = await request.json();

        logger.info('POST /api/draft - start', {
            userId: currentUser.id,
            currentStep: body.currentStep,
            draftId: body.draftId,
        });

        if (
            body.currentStep !== undefined &&
            (typeof body.currentStep !== 'number' ||
                body.currentStep < 0 ||
                body.currentStep >= STEPS_LENGTH)
        ) {
            body.currentStep = 0;
        }

        if (body.draftId) {
            const rawDraft = await DraftService.getSharedDraft(body.draftId);
            if (
                rawDraft ||
                body.inviteToken ||
                (Array.isArray(body.coCooksIds) && body.coCooksIds.length > 0)
            ) {
                try {
                    const savedDraft = await DraftService.saveSharedDraft(
                        body.draftId,
                        body,
                        currentUser
                    );

                    logger.info('POST /api/draft - success (shared)', {
                        userId: currentUser.id,
                        draftId: body.draftId,
                    });
                    return NextResponse.json(savedDraft);
                } catch (err: any) {
                    if (err.message === 'UNAUTHORIZED_DRAFT_UPDATE') {
                        return forbiddenResponse(
                            'You are not authorized to update this shared draft'
                        );
                    }
                    throw err;
                }
            }
        }

        // Single-user draft
        try {
            const slotId = body.slotId || body.draftId;
            const id = await DraftService.saveSingleUserDraft(
                currentUser.id,
                body,
                slotId
            );
            body.draftId = id;
            if (!body.updatedAt) {
                body.updatedAt = new Date().toISOString();
            }
            logger.info('POST /api/draft - success (single user)', {
                userId: currentUser.id,
                slotId: id,
            });
            return NextResponse.json(body);
        } catch (err: any) {
            if (err.message === 'MAX_SOLO_DRAFTS_REACHED') {
                return NextResponse.json(
                    { error: 'MAX_SOLO_DRAFTS_REACHED' },
                    { status: 409 }
                );
            }
            throw err;
        }
    } catch (error: any) {
        logger.error('POST /api/draft - error', { error: error.message });
        return internalServerError('Failed to save draft');
    }
}

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to get draft'
            );
        }

        const { searchParams } = new URL(request.url);
        const draftId =
            searchParams.get('draftId') || searchParams.get('draft');

        if (draftId) {
            const rawDraft = await DraftService.getSharedDraft(draftId);
            if (rawDraft) {
                const isOwner = rawDraft.ownerId === currentUser.id;
                const isCoCook =
                    Array.isArray(rawDraft.coCooksIds) &&
                    rawDraft.coCooksIds.includes(currentUser.id);

                if (!isOwner && !isCoCook) {
                    return forbiddenResponse(
                        'You are not authorized to view this draft'
                    );
                }

                const draft = await DraftService.getSharedDraft(
                    draftId,
                    currentUser.id
                );

                logger.info('GET /api/draft - success (shared)', {
                    userId: currentUser.id,
                    draftId,
                });
                return NextResponse.json(draft);
            }

            const soloDraft = await DraftService.getSingleUserDraft(
                currentUser.id,
                draftId
            );
            if (soloDraft) {
                return NextResponse.json(soloDraft);
            }

            return NextResponse.json(null);
        }

        const slotId = searchParams.get('slotId') || undefined;

        logger.info('GET /api/draft - start (single user)', {
            userId: currentUser.id,
            slotId,
        });
        const data = await DraftService.getSingleUserDraft(
            currentUser.id,
            slotId
        );

        logger.info('GET /api/draft - success (single user)', {
            userId: currentUser.id,
            hasDraft: !!data,
            slotId,
        });
        return NextResponse.json(data);
    } catch (error: any) {
        logger.error('GET /api/draft - error', { error: error.message });
        return internalServerError('Failed to retrieve draft');
    }
}

export async function DELETE(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return unauthorizedResponse(
                'User authentication required to delete draft'
            );
        }

        const { searchParams } = new URL(request.url);
        const draftId =
            searchParams.get('draftId') || searchParams.get('draft');

        if (draftId) {
            try {
                await DraftService.deleteSharedDraft(draftId, currentUser);

                logger.info('DELETE /api/draft - success (shared/slot)', {
                    userId: currentUser.id,
                    draftId,
                });
                return NextResponse.json(1);
            } catch (err: any) {
                if (err.message === 'ONLY_OWNER_CAN_DELETE') {
                    return forbiddenResponse(
                        'Only the draft owner can delete this shared draft'
                    );
                }
                if (err.message === 'CORRUPTED_DRAFT_DATA') {
                    return internalServerError('Draft data is corrupted');
                }
                throw err;
            }
        }

        const slotId = searchParams.get('slotId') || undefined;

        logger.info('DELETE /api/draft - start (single user)', {
            userId: currentUser.id,
            slotId,
        });
        const deleted = await DraftService.deleteSingleUserDraft(
            currentUser.id,
            slotId
        );

        logger.info('DELETE /api/draft - success (single user)', {
            userId: currentUser.id,
            slotId,
        });
        return NextResponse.json(deleted ? 1 : 0);
    } catch (error: any) {
        logger.error('DELETE /api/draft - error', { error: error.message });
        return internalServerError('Failed to delete draft');
    }
}

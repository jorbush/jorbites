import { expect } from '@jest/globals';
import {
    POST as DraftPOST,
    GET as DraftGET,
    DELETE as DraftDELETE,
} from '@/app/api/draft/route';
import { Session } from 'next-auth';
import { DraftService } from '@/app/services/draftService';

let mockedSession: Session | null = null;

const mockUser = {
    id: 'test-slot-user',
    name: 'Slot User',
    email: 'slotuser@test.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
};

jest.mock('@/app/lib/prismadb', () => ({
    user: {
        findUnique: jest.fn(),
    },
}));

import prisma from '@/app/lib/prismadb';

jest.mock('@/pages/api/auth/[...nextauth].ts', () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(() => {
        return Promise.resolve(mockedSession);
    }),
}));

jest.mock('@/app/services/draftService', () => ({
    DraftService: {
        saveSingleUserDraft: jest.fn(),
        getSingleUserDraft: jest.fn(),
        deleteSingleUserDraft: jest.fn(),
        saveSharedDraft: jest.fn(),
        getSharedDraft: jest.fn(),
        deleteSharedDraft: jest.fn(),
    },
}));

describe('Draft API Multi-Slot Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedSession = {
            user: { email: mockUser.email },
            expires: '2026-12-31',
        };
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    });

    describe('POST /api/draft with slotId', () => {
        it('saves solo draft with provided slotId and returns slotId', async () => {
            (DraftService.saveSingleUserDraft as jest.Mock).mockResolvedValue(
                'slot-xyz'
            );

            const req = new Request('http://localhost:3000/api/draft', {
                method: 'POST',
                body: JSON.stringify({
                    slotId: 'slot-xyz',
                    title: 'Draft in Slot XYZ',
                }),
            });

            const res = await DraftPOST(req as any);
            expect(res.status).toBe(200);

            const json = await res.json();
            expect(json.draftId).toBe('slot-xyz');
            expect(DraftService.saveSingleUserDraft).toHaveBeenCalledWith(
                mockUser.id,
                expect.objectContaining({ title: 'Draft in Slot XYZ' }),
                'slot-xyz'
            );
        });

        it('returns 409 Conflict when MAX_SOLO_DRAFTS_REACHED error is thrown', async () => {
            (DraftService.saveSingleUserDraft as jest.Mock).mockRejectedValue(
                new Error('MAX_SOLO_DRAFTS_REACHED')
            );

            const req = new Request('http://localhost:3000/api/draft', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Sixth Draft Attempt',
                }),
            });

            const res = await DraftPOST(req as any);
            expect(res.status).toBe(409);

            const json = await res.json();
            expect(json.error).toBe('MAX_SOLO_DRAFTS_REACHED');
        });
    });

    describe('GET /api/draft with slotId query param', () => {
        it('fetches solo draft by slotId query param', async () => {
            const mockDraftData = {
                title: 'Draft In Slot 4',
                draftId: 'slot-4',
            };
            (DraftService.getSingleUserDraft as jest.Mock).mockResolvedValue(
                mockDraftData
            );

            const req = new Request(
                'http://localhost:3000/api/draft?slotId=slot-4'
            );
            const res = await DraftGET(req as any);

            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.title).toBe('Draft In Slot 4');
            expect(DraftService.getSingleUserDraft).toHaveBeenCalledWith(
                mockUser.id,
                'slot-4'
            );
        });
    });

    describe('DELETE /api/draft with slotId query param', () => {
        it('deletes solo draft by slotId', async () => {
            (DraftService.deleteSingleUserDraft as jest.Mock).mockResolvedValue(
                true
            );

            const req = new Request(
                'http://localhost:3000/api/draft?slotId=slot-to-remove',
                {
                    method: 'DELETE',
                }
            );
            const res = await DraftDELETE(req as any);

            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json).toBe(1);
            expect(DraftService.deleteSingleUserDraft).toHaveBeenCalledWith(
                mockUser.id,
                'slot-to-remove'
            );
        });
    });
});

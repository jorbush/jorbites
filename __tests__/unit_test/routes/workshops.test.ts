import { expect } from '@jest/globals';
import getWorkshops from '@/app/actions/getWorkshops';
import { Session } from 'next-auth';
import { POST as WorkshopPOST } from '@/app/api/workshops/route';
import {
    PATCH as WorkshopPATCH,
    DELETE as WorkshopDELETE,
} from '@/app/api/workshop/[workshopId]/route';
import { POST as WorkshopJoinPOST } from '@/app/api/workshop/[workshopId]/join/route';
import { NextRequest } from 'next/server';
import {
    WORKSHOP_TITLE_MAX_LENGTH,
    WORKSHOP_DESCRIPTION_MAX_LENGTH,
    WORKSHOP_LOCATION_MAX_LENGTH,
    WORKSHOP_MAX_INGREDIENTS,
    WORKSHOP_MAX_STEPS,
} from '@/app/utils/constants';

let mockedSession: Session | null = null;

// Mock auth
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

describe('Workshops API Routes and Server Actions', () => {
    let initialUser: any = null;

    beforeAll(async () => {
        // Create a test user
        const currentDate = new Date();
        const userData = {
            name: 'Workshop Test User',
            email: `workshop_test_${currentDate.getTime()}@test.com`,
            hashedPassword: 'hashedPassword',
        };

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const createdUser = await prisma.user.create({
            data: userData,
        });

        initialUser = {
            ...createdUser,
            createdAt: createdUser.createdAt.toISOString(),
            updatedAt: createdUser.updatedAt.toISOString(),
            emailVerified: createdUser.emailVerified?.toISOString() || null,
        };
    });

    afterAll(async () => {
        // Clean up: delete test user
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        if (initialUser) {
            await prisma.user.delete({
                where: { id: initialUser.id },
            });
        }

        await prisma.$disconnect();
    });

    describe('POST /api/workshops - Create Workshop Error Handling', () => {
        beforeEach(() => {
            mockedSession = {
                user: { email: initialUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };
        });

        it('should reject workshop creation without authentication', async () => {
            mockedSession = null;

            const workshopData = {
                title: 'Unauthorized Workshop',
                description: 'Should not be created',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(401);
        });

        it('should reject workshop with missing required fields', async () => {
            const workshopData = {
                title: 'Incomplete Workshop',
                // Missing description, date, location
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(400);
        });

        it('should reject workshop with title too long', async () => {
            const workshopData = {
                title: 'A'.repeat(WORKSHOP_TITLE_MAX_LENGTH + 1),
                description: 'Valid description',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(400);
        });

        it('should reject workshop with description too long', async () => {
            const workshopData = {
                title: 'Valid Title',
                description: 'A'.repeat(WORKSHOP_DESCRIPTION_MAX_LENGTH + 1),
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(400);
        });

        it('should reject workshop with location too long', async () => {
            const workshopData = {
                title: 'Valid Title',
                description: 'Valid description',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'A'.repeat(WORKSHOP_LOCATION_MAX_LENGTH + 1),
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(400);
        });

        it('should reject workshop with date in the past', async () => {
            const workshopData = {
                title: 'Valid Title',
                description: 'Valid description',
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                location: 'Test',
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(400);
        });

        it('should reject workshop with too many ingredients', async () => {
            const workshopData = {
                title: 'Valid Title',
                description: 'Valid description',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
                ingredients: Array(WORKSHOP_MAX_INGREDIENTS + 1).fill(
                    'ingredient'
                ),
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(400);
        });

        it('should reject workshop with too many previous steps', async () => {
            const workshopData = {
                title: 'Valid Title',
                description: 'Valid description',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
                previousSteps: Array(WORKSHOP_MAX_STEPS + 1).fill('step'),
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            expect(res.status).toBe(400);
        });
    });

    describe('PATCH /api/workshop/[workshopId] - Update Workshop Error Handling', () => {
        it('should reject update without authentication', async () => {
            mockedSession = null;

            const updateData = {
                title: 'Unauthorized Update',
                description: 'Should not work',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
            };

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/fake-workshop-id`,
                {
                    method: 'PATCH',
                    body: JSON.stringify(updateData),
                }
            );

            const res = await WorkshopPATCH(req, {
                params: Promise.resolve({ workshopId: 'fake-workshop-id' }),
            });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/workshop/[workshopId]/join - Join/Leave Workshop Error Handling', () => {
        it('should reject join without authentication', async () => {
            mockedSession = null;

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/fake-workshop-id/join`,
                {
                    method: 'POST',
                    body: JSON.stringify({ action: 'join' }),
                }
            );

            const res = await WorkshopJoinPOST(req, {
                params: Promise.resolve({ workshopId: 'fake-workshop-id' }),
            });

            expect(res.status).toBe(401);
        });

        it('should reject with invalid action', async () => {
            mockedSession = {
                user: { email: initialUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/fake-workshop-id/join`,
                {
                    method: 'POST',
                    body: JSON.stringify({ action: 'invalid' }),
                }
            );

            const res = await WorkshopJoinPOST(req, {
                params: Promise.resolve({ workshopId: 'fake-workshop-id' }),
            });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/workshop/[workshopId] - Delete Workshop Error Handling', () => {
        it('should reject delete without authentication', async () => {
            mockedSession = null;

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/fake-workshop-id`,
                {
                    method: 'DELETE',
                }
            );

            const res = await WorkshopDELETE(req, {
                params: Promise.resolve({ workshopId: 'fake-workshop-id' }),
            });

            expect(res.status).toBe(401);
        });
    });

    describe('Server Actions - Get Workshops', () => {
        it('should get workshops list', async () => {
            const result = await getWorkshops({ limit: 10 });

            expect(result.error).toBeNull();
            expect(result.data).not.toBeNull();
            expect(Array.isArray(result.data?.workshops)).toBe(true);
        });

        it('should filter upcoming workshops', async () => {
            const result = await getWorkshops({
                limit: 10,
            });

            expect(result.data).not.toBeNull();
            if (result.data && result.data.workshops.length > 0) {
                const allUpcoming = result.data.workshops.every((w: any) => {
                    return new Date(w.date) >= new Date();
                });
                expect(allUpcoming).toBe(true);
            }
        });

        it('should handle search with no results', async () => {
            const result = await getWorkshops({
                search: 'NonExistentWorkshopTitle12345',
                limit: 10,
            });

            expect(result.data).not.toBeNull();
            expect(result.data?.workshops).toBeDefined();
        });
    });
});

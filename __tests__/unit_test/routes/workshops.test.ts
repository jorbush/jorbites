import { expect } from '@jest/globals';
import getWorkshops from '@/app/actions/getWorkshops';
import { Session } from 'next-auth';
import { POST as WorkshopPOST } from '@/app/api/workshops/route';
import {
    PATCH as WorkshopPATCH,
    DELETE as WorkshopDELETE,
} from '@/app/api/workshop/[workshopId]/route';
import { POST as WorkshopJoinPOST } from '@/app/api/workshop/[workshopId]/join/route';
import getWorkshopById from '@/app/actions/getWorkshopById';
import getWorkshopsByUserId from '@/app/actions/getWorkshopsByUserId';
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
    let initialWorkshops: any[] = [];
    let publishedWorkshop: any = null;

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

        // Get initial workshops
        const workshops = await getWorkshops({ limit: 100 });
        initialWorkshops = workshops.data?.workshops || [];
    });

    afterAll(async () => {
        // Clean up: delete test workshops and user
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        if (publishedWorkshop) {
            await prisma.workshop.deleteMany({
                where: { id: publishedWorkshop.id },
            });
        }

        if (initialUser) {
            await prisma.user.delete({
                where: { id: initialUser.id },
            });
        }

        await prisma.$disconnect();
    });

    describe('POST /api/workshops - Create Workshop', () => {
        it('should create a workshop successfully', async () => {
            mockedSession = {
                user: { email: initialUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

            const futureDate = new Date(Date.now() + 86400000); // Tomorrow
            const workshopData = {
                title: 'Test Workshop',
                description: 'A test workshop description',
                date: futureDate.toISOString(),
                location: 'Test Location',
                isRecurrent: false,
                isPrivate: false,
                price: 25.5,
                ingredients: ['ingredient1', 'ingredient2'],
                previousSteps: ['step1'],
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.title).toBe('Test Workshop');
            expect(data.location).toBe('Test Location');
            expect(data.price).toBe(25.5);
            expect(data.hostId).toBe(initialUser.id);

            publishedWorkshop = data;
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
            mockedSession = {
                user: { email: initialUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

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

        it('should create private workshop with whitelisted users', async () => {
            const workshopData = {
                title: 'Private Workshop',
                description: 'A private workshop',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Private Location',
                isPrivate: true,
                whitelistedUserIds: [initialUser.id],
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.isPrivate).toBe(true);
            expect(data.whitelistedUserIds).toContain(initialUser.id);

            // Clean up
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.workshop.delete({ where: { id: data.id } });
        });
    });

    describe('PATCH /api/workshop/[workshopId] - Update Workshop', () => {
        it('should update workshop successfully', async () => {
            mockedSession = {
                user: { email: initialUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

            const updateData = {
                title: 'Updated Workshop Title',
                description: 'Updated description',
                date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
                location: 'Updated Location',
                price: 30,
                ingredients: ['new ingredient'],
                previousSteps: [],
            };

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify(updateData),
                }
            );

            const res = await WorkshopPATCH(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });
            const data = await res.json();

            expect(res.status).toBe(200);
            expect(data.title).toBe('Updated Workshop Title');
            expect(data.location).toBe('Updated Location');
            expect(data.price).toBe(30);
        });

        it('should reject update from non-host user', async () => {
            // Create another user
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const anotherUser = await prisma.user.create({
                data: {
                    name: 'Another User',
                    email: `another_${Date.now()}@test.com`,
                    hashedPassword: 'hashedPassword',
                },
            });

            mockedSession = {
                user: { email: anotherUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

            const updateData = {
                title: 'Unauthorized Update',
                description: 'Should not work',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
            };

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify(updateData),
                }
            );

            const res = await WorkshopPATCH(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });

            expect(res.status).toBe(403);

            // Clean up
            await prisma.user.delete({ where: { id: anotherUser.id } });
        });

        it('should reject update without authentication', async () => {
            mockedSession = null;

            const updateData = {
                title: 'Unauthorized Update',
                description: 'Should not work',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test',
            };

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify(updateData),
                }
            );

            const res = await WorkshopPATCH(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/workshop/[workshopId]/join - Join/Leave Workshop', () => {
        let testParticipant: any;

        beforeAll(async () => {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            testParticipant = await prisma.user.create({
                data: {
                    name: 'Test Participant',
                    email: `participant_${Date.now()}@test.com`,
                    hashedPassword: 'hashedPassword',
                },
            });
        });

        afterAll(async () => {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            if (testParticipant) {
                await prisma.user.delete({ where: { id: testParticipant.id } });
            }
        });

        it('should join workshop successfully', async () => {
            mockedSession = {
                user: { email: testParticipant.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}/join`,
                {
                    method: 'POST',
                    body: JSON.stringify({ action: 'join' }),
                }
            );

            const res = await WorkshopJoinPOST(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });

            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.message).toContain('Successfully joined workshop');
        });

        it('should prevent joining twice', async () => {
            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}/join`,
                {
                    method: 'POST',
                    body: JSON.stringify({ action: 'join' }),
                }
            );

            const res = await WorkshopJoinPOST(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });

            expect(res.status).toBe(400);
        });

        it('should leave workshop successfully', async () => {
            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}/join`,
                {
                    method: 'POST',
                    body: JSON.stringify({ action: 'leave' }),
                }
            );

            const res = await WorkshopJoinPOST(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });

            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.message).toContain('Successfully left workshop');
        });

        it('should reject join without authentication', async () => {
            mockedSession = null;

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}/join`,
                {
                    method: 'POST',
                    body: JSON.stringify({ action: 'join' }),
                }
            );

            const res = await WorkshopJoinPOST(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/workshop/[workshopId] - Delete Workshop', () => {
        it('should delete workshop successfully', async () => {
            mockedSession = {
                user: { email: initialUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

            const req = new NextRequest(
                `http://localhost:3000/api/workshop/${publishedWorkshop.id}`,
                {
                    method: 'DELETE',
                }
            );

            const res = await WorkshopDELETE(req, {
                params: Promise.resolve({ workshopId: publishedWorkshop.id }),
            });

            expect(res.status).toBe(200);

            // Verify deletion
            const workshop = await getWorkshopById({
                workshopId: publishedWorkshop.id,
            });
            expect(workshop).toBeNull();

            publishedWorkshop = null;
        });
    });

    describe('Server Actions - Get Workshops', () => {
        let testWorkshop: any;

        beforeAll(async () => {
            mockedSession = {
                user: { email: initialUser.email },
                expires: new Date(Date.now() + 86400000).toISOString(),
            };

            const workshopData = {
                title: 'Server Action Test Workshop',
                description: 'Testing server actions',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Test Location',
            };

            const req = new NextRequest('http://localhost:3000/api/workshops', {
                method: 'POST',
                body: JSON.stringify(workshopData),
            });

            const res = await WorkshopPOST(req);
            testWorkshop = await res.json();
        });

        afterAll(async () => {
            if (testWorkshop) {
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                await prisma.workshop.deleteMany({
                    where: { id: testWorkshop.id },
                });
            }
        });

        it('should get workshops list', async () => {
            const result = await getWorkshops({ limit: 10 });

            expect(result.error).toBeNull();
            expect(result.data).not.toBeNull();
            expect(Array.isArray(result.data?.workshops)).toBe(true);
        });

        it('should get workshop by id', async () => {
            const workshop = await getWorkshopById({
                workshopId: testWorkshop.id,
            });

            expect(workshop).not.toBeNull();
            expect(workshop?.id).toBe(testWorkshop.id);
            expect(workshop?.title).toBe('Server Action Test Workshop');
        });

        it('should get workshops by user id', async () => {
            const workshops = await getWorkshopsByUserId({
                userId: initialUser.id,
            });

            expect(Array.isArray(workshops)).toBe(true);
            expect(workshops.length).toBeGreaterThan(0);
            expect(workshops[0].hostId).toBe(initialUser.id);
        });

        it('should filter upcoming workshops', async () => {
            const result = await getWorkshops({
                upcoming: true,
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

        it('should search workshops by title', async () => {
            const result = await getWorkshops({
                search: 'Server Action',
                limit: 10,
            });

            expect(result.data).not.toBeNull();
            if (result.data && result.data.workshops.length > 0) {
                const found = result.data.workshops.some(
                    (w: any) => w.id === testWorkshop.id
                );
                expect(found).toBe(true);
            }
        });
    });
});

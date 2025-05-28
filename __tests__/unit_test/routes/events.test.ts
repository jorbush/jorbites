import { expect } from '@jest/globals';
import { GET as EventsGET } from '@/app/api/events/route';
import { GET as EventSlugGET } from '@/app/api/events/[slug]/route';
import { NextRequest } from 'next/server';

// Mock the event utilities
jest.mock('@/app/utils/event-utils', () => ({
    getAllEvents: jest.fn(),
    getEventBySlug: jest.fn(),
}));

import { getAllEvents, getEventBySlug } from '@/app/utils/event-utils';

describe('Events API Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/events', () => {
        it('should return events successfully', async () => {
            const mockEvents = [{ id: '1', title: 'Test Event' }];
            (getAllEvents as jest.Mock).mockResolvedValueOnce(mockEvents);

            const request = new NextRequest('http://localhost:3000/api/events');
            const response = await EventsGET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockEvents);
            expect(getAllEvents).toHaveBeenCalledWith('en');
        });

        it('should handle language parameter correctly', async () => {
            const mockEvents = [{ id: '1', title: 'Test Event' }];
            (getAllEvents as jest.Mock).mockResolvedValueOnce(mockEvents);

            const request = new NextRequest(
                'http://localhost:3000/api/events?lang=es'
            );
            const response = await EventsGET(request);

            expect(response.status).toBe(200);
            expect(getAllEvents).toHaveBeenCalledWith('es');
        });

        it('should default to en for invalid language', async () => {
            const mockEvents = [{ id: '1', title: 'Test Event' }];
            (getAllEvents as jest.Mock).mockResolvedValueOnce(mockEvents);

            const request = new NextRequest(
                'http://localhost:3000/api/events?lang=invalid'
            );
            const response = await EventsGET(request);

            expect(response.status).toBe(200);
            expect(getAllEvents).toHaveBeenCalledWith('en');
        });

        it('should return 500 when getAllEvents throws an error', async () => {
            (getAllEvents as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const request = new NextRequest('http://localhost:3000/api/events');
            const response = await EventsGET(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch events');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });

    describe('GET /api/events/[slug]', () => {
        it('should return event by slug successfully', async () => {
            const mockEvent = {
                id: '1',
                slug: 'test-event',
                title: 'Test Event',
            };
            (getEventBySlug as jest.Mock).mockResolvedValueOnce(mockEvent);

            const mockParams = {
                params: Promise.resolve({ slug: 'test-event' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/events/test-event'
            );
            const response = await EventSlugGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockEvent);
            expect(getEventBySlug).toHaveBeenCalledWith('test-event', 'en');
        });

        it('should handle language parameter correctly', async () => {
            const mockEvent = {
                id: '1',
                slug: 'test-event',
                title: 'Test Event',
            };
            (getEventBySlug as jest.Mock).mockResolvedValueOnce(mockEvent);

            const mockParams = {
                params: Promise.resolve({ slug: 'test-event' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/events/test-event?lang=ca'
            );
            const response = await EventSlugGET(request, mockParams);

            expect(response.status).toBe(200);
            expect(getEventBySlug).toHaveBeenCalledWith('test-event', 'ca');
        });

        it('should return 404 when event is not found', async () => {
            (getEventBySlug as jest.Mock).mockResolvedValueOnce(null);

            const mockParams = {
                params: Promise.resolve({ slug: 'non-existent' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/events/non-existent'
            );
            const response = await EventSlugGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toBe('Event not found');
            expect(data.code).toBe('NOT_FOUND');
            expect(data.timestamp).toBeDefined();
        });

        it('should return 500 when getEventBySlug throws an error', async () => {
            (getEventBySlug as jest.Mock).mockRejectedValueOnce(
                new Error('Database error')
            );

            const mockParams = {
                params: Promise.resolve({ slug: 'test-event' }),
            };

            const request = new NextRequest(
                'http://localhost:3000/api/events/test-event'
            );
            const response = await EventSlugGET(request, mockParams);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch event');
            expect(data.code).toBe('INTERNAL_SERVER_ERROR');
            expect(data.timestamp).toBeDefined();
        });
    });
});

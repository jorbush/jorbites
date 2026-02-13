import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getSitemapData } from '@/app/sitemap';

const mockFindMany = vi.fn();
vi.mock('@/app/lib/prismadb', () => ({
    default: {
        recipe: {
            findMany: (...args: any[]) => mockFindMany('recipe', ...args),
        },
        user: {
            findMany: (...args: any[]) => mockFindMany('user', ...args),
        },
    },
}));

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
    },
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
}));
import fs from 'fs';

vi.mock('path', () => ({
    default: {
        join: (...args: string[]) => args.join('/'),
    },
    join: (...args: string[]) => args.join('/'),
}));

describe('getSitemapData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate sitemap entries correctly', async () => {
        // Setup mocks
        mockFindMany.mockImplementation((model: string) => {
            if (model === 'recipe') {
                return Promise.resolve([
                    { id: 'recipe1', createdAt: new Date('2023-01-01') },
                ]);
            }
            if (model === 'user') {
                return Promise.resolve([
                    {
                        id: 'user1',
                        updatedAt: new Date('2023-01-02'),
                        createdAt: new Date('2023-01-01'),
                    },
                ]);
            }
            return Promise.resolve([]);
        });

        // Mock fs for events
        (fs.existsSync as any).mockReturnValue(true);
        (fs.readdirSync as any).mockReturnValue(['event1.md']);

        const sitemap = await getSitemapData();

        // Verify base URL
        expect(sitemap).toContainEqual(
            expect.objectContaining({
                url: 'https://jorbites.com',
            })
        );

        // Verify recipe entry
        expect(sitemap).toContainEqual(
            expect.objectContaining({
                url: 'https://jorbites.com/recipes/recipe1',
            })
        );

        // Verify event entry
        expect(sitemap).toContainEqual(
            expect.objectContaining({
                url: 'https://jorbites.com/events/event1',
            })
        );

        // Verify user entry
        expect(sitemap).toContainEqual(
            expect.objectContaining({
                url: 'https://jorbites.com/profile/user1',
            })
        );
    });
});

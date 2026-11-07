import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metadata as listsPageMetadata } from '@/app/lists/page';
import { generateMetadata as generateListMetadata } from '@/app/lists/[listId]/page';
import getListById from '@/app/actions/getListById';
import { NextResponse } from 'next/server';

vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/actions/getLists', () => ({
    default: vi.fn(() => Promise.resolve({ myLists: [], communityLists: [] })),
}));

vi.mock('@/app/actions/getListById', () => ({
    default: vi.fn(),
}));

describe('Lists SEO Metadata', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('/lists page metadata', () => {
        it('defines title, description, keywords, and canonical', () => {
            expect(listsPageMetadata.title).toBe(
                'Listas de Recetas | Jorbites'
            );
            expect(listsPageMetadata.description).toBeDefined();
            expect(listsPageMetadata.keywords).toBeDefined();
            expect(listsPageMetadata.alternates?.canonical).toBe('/lists');
        });

        it('defines OpenGraph and Twitter card metadata', () => {
            const og = listsPageMetadata.openGraph as any;
            expect(og).toBeDefined();
            expect(og.title).toContain('Listas');
            expect(og.url).toBe('/lists');
            expect(og.siteName).toBe('Jorbites');
            expect(og.images).toBeDefined();
            expect(og.images.length).toBeGreaterThan(0);

            const twitter = listsPageMetadata.twitter as any;
            expect(twitter).toBeDefined();
            expect(twitter.card).toBe('summary_large_image');
        });

        it('defines robots directives for indexing', () => {
            const robots = listsPageMetadata.robots as any;
            expect(robots).toBeDefined();
            expect(robots.index).toBe(true);
            expect(robots.follow).toBe(true);
        });
    });

    describe('/lists/[listId] generateMetadata', () => {
        it('returns noindex when list is not found', async () => {
            vi.mocked(getListById).mockResolvedValue(null as any);

            const metadata = await generateListMetadata({
                params: Promise.resolve({ listId: 'missing-id' }),
            });

            expect(metadata.title).toBe('Lista no encontrada | Jorbites');
            expect(metadata.robots).toEqual({
                index: false,
                follow: false,
            });
        });

        it('returns noindex when getListById returns an error response', async () => {
            vi.mocked(getListById).mockResolvedValue(
                new NextResponse('Not found', { status: 404 }) as any
            );

            const metadata = await generateListMetadata({
                params: Promise.resolve({ listId: 'error-id' }),
            });

            expect(metadata.title).toBe('Lista no encontrada | Jorbites');
            expect(metadata.robots).toEqual({
                index: false,
                follow: false,
            });
        });

        it('returns noindex when list is private', async () => {
            vi.mocked(getListById).mockResolvedValue({
                list: {
                    id: 'private-list',
                    name: 'Secret Recipes',
                    isPrivate: true,
                    isDefault: false,
                    userId: 'u1',
                    recipeIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                recipes: [],
            } as any);

            const metadata = await generateListMetadata({
                params: Promise.resolve({ listId: 'private-list' }),
            });

            expect(metadata.title).toBe('Secret Recipes | Jorbites');
            expect(metadata.robots).toEqual({
                index: false,
                follow: false,
            });
        });

        it('returns full indexable SEO metadata when list is public with recipes', async () => {
            vi.mocked(getListById).mockResolvedValue({
                list: {
                    id: 'public-list',
                    name: 'Verano Fresco',
                    isPrivate: false,
                    isDefault: false,
                    userId: 'u1',
                    recipeIds: ['r1', 'r2'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    user: {
                        id: 'u1',
                        name: 'Chef Carlos',
                    },
                },
                recipes: [
                    {
                        id: 'r1',
                        title: 'Gazpacho Andaluz',
                        imageSrc:
                            'https://res.cloudinary.com/demo/image/upload/v1/gazpacho.jpg',
                    },
                    {
                        id: 'r2',
                        title: 'Ensalada Camperas',
                        imageSrc: null,
                    },
                ],
            } as any);

            const metadata = await generateListMetadata({
                params: Promise.resolve({ listId: 'public-list' }),
            });

            expect(metadata.title).toBe(
                'Verano Fresco | Lista de Recetas | Jorbites'
            );
            expect(metadata.description).toContain('Verano Fresco');
            expect(metadata.description).toContain('Chef Carlos');
            expect(metadata.description).toContain('Gazpacho Andaluz');
            expect(metadata.alternates?.canonical).toBe('/lists/public-list');

            const og = metadata.openGraph as any;
            expect(og).toBeDefined();
            expect(og.title).toBe('Verano Fresco | Jorbites');
            expect(og.url).toBe('/lists/public-list');
            expect(og.images[0].url).toContain('cloudinary.com');

            const twitter = metadata.twitter as any;
            expect(twitter.card).toBe('summary_large_image');
            expect(twitter.images[0]).toContain('cloudinary.com');

            const robots = metadata.robots as any;
            expect(robots.index).toBe(true);
            expect(robots.follow).toBe(true);
        });

        it('uses fallback image and description when list has no recipes', async () => {
            vi.mocked(getListById).mockResolvedValue({
                list: {
                    id: 'empty-list',
                    name: 'Futuras Ideas',
                    isPrivate: false,
                    isDefault: false,
                    userId: 'u1',
                    recipeIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    user: {
                        id: 'u1',
                        name: 'Chef Carlos',
                    },
                },
                recipes: [],
            } as any);

            const metadata = await generateListMetadata({
                params: Promise.resolve({ listId: 'empty-list' }),
            });

            expect(metadata.description).toContain('Futuras Ideas');
            expect(metadata.description).toContain('Chef Carlos');

            const og = metadata.openGraph as any;
            expect(og.images[0].url).toBe('/jorbites-social.jpg');
        });
    });
});

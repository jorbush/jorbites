import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    readEventFile,
    getEventTranslations,
    getEventBySlug,
    getAllEvents,
    getEventsDirectory,
} from '@/app/utils/event-utils';
import fs from 'fs';

// Mock fs and path modules
vi.mock('fs', () => ({
    default: {
        readFileSync: vi.fn(),
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
    },
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
}));

vi.mock('path', () => ({
    default: {
        join: vi.fn((...args) => args.join('/')),
    },
    join: vi.fn((...args) => args.join('/')),
}));

// Mock gray-matter
vi.mock('gray-matter', () => ({
    default: vi.fn((content: any) => {
        if (
            content &&
            typeof content === 'string' &&
            content.includes('error')
        ) {
            throw new Error('Invalid frontmatter');
        }
        return {
            data: {
                title: 'Test Event',
                description: 'Test description',
                date: '2026-05-02T00:00:00.000Z',
                endDate: '2026-05-31T23:59:59.000Z',
                image: '/images/events/test.webp',
            },
            content: 'Test content',
        };
    }),
}));

describe('event-utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('readEventFile', () => {
        it('should read and parse a valid event file', () => {
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const result = readEventFile('/path/to/event.md');

            expect(result.frontmatter.title).toBe('Test Event');
            expect(result.frontmatter.description).toBe('Test description');
            expect(result.content).toBe('Test content');
        });

        it('should return error frontmatter and content for nonexistent file or error', () => {
            vi.mocked(fs.readFileSync).mockImplementation(() => {
                throw new Error('File not found');
            });

            const result = readEventFile('/nonexistent/path/file.md');

            expect(result.frontmatter.title).toBe('Error');
            expect(result.frontmatter.description).toBe('Error loading event');
            expect(result.content).toBe('Error loading event content.');
        });

        it('should handle invalid frontmatter gracefully', () => {
            vi.mocked(fs.readFileSync).mockReturnValue('error content');

            const result = readEventFile('/invalid/path/file.md');

            expect(result.frontmatter.title).toBe('Error');
            expect(result.content).toBe('Error loading event content.');
        });
    });

    describe('getEventsDirectory', () => {
        it('should return default candidate if existsSync is true', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);

            const result = getEventsDirectory('es');
            expect(result).toContain('app/content/events/es');
        });

        it('should check fallback candidate if primary does not exist', () => {
            vi.mocked(fs.existsSync).mockImplementation((p: any) => {
                return (
                    typeof p === 'string' &&
                    p.includes('jorbites/app/content/events')
                );
            });

            const result = getEventsDirectory('es');
            expect(result).toContain('jorbites/app/content/events/es');
        });
    });

    describe('getEventTranslations', () => {
        it('should retrieve localized titles and descriptions across allowed languages', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockImplementation(
                (filePath: any) => filePath
            );

            const matter = await import('gray-matter');
            vi.mocked(matter.default).mockImplementation((filePath: any) => {
                if (filePath.includes('/es/')) {
                    return {
                        data: {
                            title: '🌮 Fiesta Mexicana 🌮',
                            description:
                                '¡Celebra los vibrantes sabores de México!',
                        },
                        content: 'Contenido es',
                    } as any;
                }
                if (filePath.includes('/en/')) {
                    return {
                        data: {
                            title: '🌮 Mexican Fiesta 🌮',
                            description:
                                'Celebrate the vibrant flavors of Mexico!',
                        },
                        content: 'Content en',
                    } as any;
                }
                if (filePath.includes('/ca/')) {
                    return {
                        data: {
                            title: '🌮 Festa Mexicana 🌮',
                            description:
                                'Celebra els vibrants sabors de Mèxic!',
                        },
                        content: 'Contingut ca',
                    } as any;
                }
                return {
                    data: {
                        title: 'Test Event',
                        description: 'Test description',
                    },
                    content: 'Content',
                } as any;
            });

            const translations = getEventTranslations('mexican_fiesta');
            expect(translations.titles.es).toBe('🌮 Fiesta Mexicana 🌮');
            expect(translations.titles.en).toBe('🌮 Mexican Fiesta 🌮');
            expect(translations.titles.ca).toBe('🌮 Festa Mexicana 🌮');
            expect(translations.descriptions.es).toBe(
                '¡Celebra los vibrantes sabores de México!'
            );
            expect(translations.descriptions.en).toBe(
                'Celebrate the vibrant flavors of Mexico!'
            );
            expect(translations.descriptions.ca).toBe(
                'Celebra els vibrants sabors de Mèxic!'
            );
        });

        it('should return empty objects when files do not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const translations = getEventTranslations('unknown_event_slug_123');
            expect(translations.titles).toEqual({});
            expect(translations.descriptions).toEqual({});
        });
    });

    describe('getEventBySlug', () => {
        it('should return null for nonexistent slug', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const event = await getEventBySlug('nonexistent_event');
            expect(event).toBeNull();
        });

        it('should return event without translations by default', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const event = await getEventBySlug('mexican_fiesta', 'es');
            expect(event).not.toBeNull();
            expect(event?.slug).toBe('mexican_fiesta');
            expect(event?.language).toBe('es');
            expect(event?.frontmatter.title).toBe('Test Event');
            expect(event?.titles).toBeUndefined();
            expect(event?.descriptions).toBeUndefined();
        });

        it('should return event with translations when includeTranslations is true', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockImplementation(
                (filePath: any) => filePath
            );

            const matter = await import('gray-matter');
            vi.mocked(matter.default).mockImplementation((filePath: any) => {
                if (filePath.includes('/es/')) {
                    return {
                        data: {
                            title: '🌮 Fiesta Mexicana 🌮',
                            description:
                                '¡Celebra los vibrantes sabores de México!',
                        },
                        content: 'Contenido es',
                    } as any;
                }
                return {
                    data: {
                        title: 'Test Event',
                        description: 'Test description',
                    },
                    content: 'Content',
                } as any;
            });

            const event = await getEventBySlug('mexican_fiesta', 'es', true);
            expect(event).not.toBeNull();
            expect(event?.slug).toBe('mexican_fiesta');
            expect(event?.titles).toBeDefined();
            expect(event?.titles?.es).toBe('🌮 Fiesta Mexicana 🌮');
        });
    });

    describe('getAllEvents', () => {
        it('should return empty array if directory does not exist', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);

            const events = await getAllEvents('es');
            expect(events).toEqual([]);
        });

        it('should return events without translations by default', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([
                'event1.md',
                'event2.md',
                'not-event.txt',
            ] as any);
            vi.mocked(fs.readFileSync).mockReturnValue('valid content');

            const events = await getAllEvents('es');
            expect(events).toHaveLength(2);
            expect(events[0].slug).toBe('event1');
            expect(events[1].slug).toBe('event2');
            expect(events[0].titles).toBeUndefined();
            expect(events[0].descriptions).toBeUndefined();
        });

        it('should return events with translations when includeTranslations is true', async () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([
                'mexican_fiesta.md',
            ] as any);
            vi.mocked(fs.readFileSync).mockImplementation(
                (filePath: any) => filePath
            );

            const matter = await import('gray-matter');
            vi.mocked(matter.default).mockImplementation((filePath: any) => {
                if (filePath.includes('/es/')) {
                    return {
                        data: {
                            title: '🌮 Fiesta Mexicana 🌮',
                            description:
                                '¡Celebra los vibrantes sabores de México!',
                        },
                        content: 'Contenido es',
                    } as any;
                }
                if (filePath.includes('/en/')) {
                    return {
                        data: {
                            title: '🌮 Mexican Fiesta 🌮',
                            description:
                                'Celebrate the vibrant flavors of Mexico!',
                        },
                        content: 'Content en',
                    } as any;
                }
                if (filePath.includes('/ca/')) {
                    return {
                        data: {
                            title: '🌮 Festa Mexicana 🌮',
                            description:
                                'Celebra els vibrants sabors de Mèxic!',
                        },
                        content: 'Contingut ca',
                    } as any;
                }
                return {
                    data: {
                        title: 'Test Event',
                        description: 'Test description',
                    },
                    content: 'Content',
                } as any;
            });

            const events = await getAllEvents('es', true);
            expect(events).toHaveLength(1);
            expect(events[0].slug).toBe('mexican_fiesta');
            expect(events[0].titles?.es).toBe('🌮 Fiesta Mexicana 🌮');
            expect(events[0].titles?.en).toBe('🌮 Mexican Fiesta 🌮');
            expect(events[0].titles?.ca).toBe('🌮 Festa Mexicana 🌮');
        });
    });
});

import { describe, it, expect } from 'vitest';
import {
    getEventTranslations,
    getEventBySlug,
    getAllEvents,
    readEventFile,
} from '@/app/utils/event-utils';

describe('event-utils', () => {
    describe('readEventFile', () => {
        it('should return error frontmatter and content for nonexistent file', () => {
            const result = readEventFile('/nonexistent/path/file.md');
            expect(result.frontmatter.title).toBe('Error');
            expect(result.content).toBe('Error loading event content.');
        });
    });

    describe('getEventTranslations', () => {
        it('should retrieve localized titles for a real event across allowed languages', () => {
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

        it('should return empty objects for an unknown event slug', () => {
            const translations = getEventTranslations('unknown_event_slug_123');
            expect(translations.titles).toEqual({});
            expect(translations.descriptions).toEqual({});
        });
    });

    describe('getEventBySlug', () => {
        it('should return null for nonexistent slug', async () => {
            const event = await getEventBySlug('nonexistent_event');
            expect(event).toBeNull();
        });

        it('should return event without translations by default', async () => {
            const event = await getEventBySlug('mexican_fiesta', 'es');
            expect(event).not.toBeNull();
            expect(event?.slug).toBe('mexican_fiesta');
            expect(event?.language).toBe('es');
            expect(event?.frontmatter.title).toBe('🌮 Fiesta Mexicana 🌮');
            expect(event?.titles).toBeUndefined();
            expect(event?.descriptions).toBeUndefined();
        });

        it('should return event with translations when includeTranslations is true', async () => {
            const event = await getEventBySlug('mexican_fiesta', 'es', true);
            expect(event).not.toBeNull();
            expect(event?.slug).toBe('mexican_fiesta');
            expect(event?.titles).toBeDefined();
            expect(event?.titles?.es).toBe('🌮 Fiesta Mexicana 🌮');
            expect(event?.titles?.en).toBe('🌮 Mexican Fiesta 🌮');
            expect(event?.titles?.ca).toBe('🌮 Festa Mexicana 🌮');
        });
    });

    describe('getAllEvents', () => {
        it('should return events without translations by default', async () => {
            const events = await getAllEvents('es');
            expect(events.length).toBeGreaterThan(0);
            expect(events[0].titles).toBeUndefined();
            expect(events[0].descriptions).toBeUndefined();
        });

        it('should return events with translations when includeTranslations is true', async () => {
            const events = await getAllEvents('es', true);
            expect(events.length).toBeGreaterThan(0);
            const mexicanFiesta = events.find(
                (e) => e.slug === 'mexican_fiesta'
            );
            expect(mexicanFiesta).toBeDefined();
            expect(mexicanFiesta?.titles?.es).toBe('🌮 Fiesta Mexicana 🌮');
            expect(mexicanFiesta?.titles?.en).toBe('🌮 Mexican Fiesta 🌮');
            expect(mexicanFiesta?.titles?.ca).toBe('🌮 Festa Mexicana 🌮');
        });
    });
});

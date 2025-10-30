import { describe, expect, it } from '@jest/globals';
import { readEventFile } from '@/app/utils/event-utils';
import path from 'path';

describe('Catalan Recipes Event', () => {
    const languages = ['en', 'es', 'ca'];

    languages.forEach((lang) => {
        describe(`${lang} version`, () => {
            it('should have valid frontmatter and content', () => {
                const filePath = path.join(
                    process.cwd(),
                    'app/content/events',
                    lang,
                    'catalan_recipes.md'
                );

                const { frontmatter, content } = readEventFile(filePath);

                // Verify frontmatter fields
                expect(frontmatter.title).toBeDefined();
                expect(frontmatter.title).toContain('Catalan');
                expect(frontmatter.date).toBeDefined();
                expect(frontmatter.endDate).toBeDefined();
                expect(frontmatter.image).toBe(
                    '/images/events/sant_jordi_2025.webp'
                );
                expect(frontmatter.description).toBeDefined();

                // Verify content is not empty
                expect(content.length).toBeGreaterThan(0);
                expect(content).toContain('Catalan');
            });

            it('should have correct date range (Nov 4-24)', () => {
                const filePath = path.join(
                    process.cwd(),
                    'app/content/events',
                    lang,
                    'catalan_recipes.md'
                );

                const { frontmatter } = readEventFile(filePath);

                const startDate = new Date(frontmatter.date);
                const endDate = new Date(frontmatter.endDate);

                expect(startDate.getMonth()).toBe(10); // November (0-indexed)
                expect(startDate.getDate()).toBe(4);
                expect(endDate.getMonth()).toBe(10);
                expect(endDate.getDate()).toBe(24);
                expect(endDate.getFullYear()).toBe(2025);
            });
        });
    });

    it('should exist in all three languages', () => {
        languages.forEach((lang) => {
            const filePath = path.join(
                process.cwd(),
                'app/content/events',
                lang,
                'catalan_recipes.md'
            );

            expect(() => readEventFile(filePath)).not.toThrow();
        });
    });
});

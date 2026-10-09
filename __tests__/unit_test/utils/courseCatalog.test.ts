import { describe, it, expect } from 'vitest';
import {
    isValidCourseId,
    getCourseCatalogEntry,
    COURSE_CATALOG,
    VALID_COURSE_IDS,
} from '@/app/utils/courseCatalog';

describe('courseCatalog utilities', () => {
    it('contains all 10 standard courses in catalog', () => {
        expect(VALID_COURSE_IDS).toHaveLength(10);
        expect(VALID_COURSE_IDS).toContain('jorbites-basics');
        expect(VALID_COURSE_IDS).toContain('recipe-creator');
        expect(VALID_COURSE_IDS).toContain('recipe-lists');
        expect(VALID_COURSE_IDS).toContain('meal-planner');
        expect(VALID_COURSE_IDS).toContain('community-events');
        expect(VALID_COURSE_IDS).toContain('workshops');
        expect(VALID_COURSE_IDS).toContain('quests');
        expect(VALID_COURSE_IDS).toContain('recipe-book-builder');
        expect(VALID_COURSE_IDS).toContain('contest-manager');
        expect(VALID_COURSE_IDS).toContain('drafts');
    });

    it('isValidCourseId correctly identifies valid and invalid IDs', () => {
        expect(isValidCourseId('jorbites-basics')).toBe(true);
        expect(isValidCourseId('contest-manager')).toBe(true);
        expect(isValidCourseId('  drafts  ')).toBe(true);

        expect(isValidCourseId('')).toBe(false);
        expect(isValidCourseId(null)).toBe(false);
        expect(isValidCourseId(undefined)).toBe(false);
        expect(isValidCourseId('fake-course')).toBe(false);
    });

    it('getCourseCatalogEntry retrieves the catalog metadata', () => {
        const basics = getCourseCatalogEntry('jorbites-basics');
        expect(basics).toBeDefined();
        expect(basics?.title).toBe('Jorbites Basics');
        expect(basics?.badgeUrl).toBe('/badges/basics_badge.webp');

        const unknown = getCourseCatalogEntry('unknown');
        expect(unknown).toBeUndefined();
    });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    formatDateRange,
    formatDateLanguage,
    formatDate,
    formatDistanceToNowLocale,
    locales,
} from '@/app/utils/date-utils';
import i18n from 'i18next';

describe('date-utils', () => {
    const testDate1 = new Date('2024-01-15T12:00:00Z');
    const testDate2 = new Date('2024-01-20T12:00:00Z');
    const testDateString1 = '2024-01-15T12:00:00Z';
    const testDateString2 = '2024-01-20T12:00:00Z';

    afterEach(() => {
        vi.unstubAllGlobals();
        try {
          const i18n = require('i18next');
          i18n.language = 'es';
        } catch {}
    });

    describe('locales', () => {
        it('should export locales object with es, en, and ca', () => {
            expect(locales).toHaveProperty('es');
            expect(locales).toHaveProperty('en');
            expect(locales).toHaveProperty('ca');
        });
    });

    describe('formatDateRange', () => {
        it('should format date range when dates are different (server-side, defaults to es)', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDateRange(testDate1, testDate2);
            // For Spanish locale, format should be dd/MM/yyyy
            expect(result).toContain('15/01/2024');
            expect(result).toContain('20/01/2024');
            expect(result).toContain(' - ');
        });

        it('should format same day dates as single date (server-side, defaults to es)', () => {
            vi.stubGlobal('window', undefined);
            const sameDay1 = new Date('2024-01-15T08:00:00Z');
            const sameDay2 = new Date('2024-01-15T18:00:00Z');
            const result = formatDateRange(sameDay1, sameDay2);
            // Should format as a single date
            expect(result).not.toContain(' - ');
            expect(result).toContain('2024');
        });

        it('should accept string inputs for dates', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDateRange(testDateString1, testDateString2);
            expect(result).toContain('15/01/2024');
            expect(result).toContain('20/01/2024');
            expect(result).toContain(' - ');
        });

        it('should accept mixed Date and string inputs', () => {
            vi.stubGlobal('window', undefined);
            const result1 = formatDateRange(testDate1, testDateString2);
            expect(result1).toContain('15/01/2024');
            expect(result1).toContain('20/01/2024');

            const result2 = formatDateRange(testDateString1, testDate2);
            expect(result2).toContain('15/01/2024');
            expect(result2).toContain('20/01/2024');
        });
    });

    describe('formatDateLanguage', () => {
        it('should format date with custom format string (server-side, defaults to es)', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDateLanguage(testDate1, 'yyyy-MM-dd');
            expect(result).toBe('2024-01-15');
        });

        it('should format date with PPP format (server-side, defaults to es)', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDateLanguage(testDate1, 'PPP');
            // PPP format gives long date format
            expect(result).toContain('2024');
        });

        it('should accept string input for date', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDateLanguage(testDateString1, 'yyyy-MM-dd');
            expect(result).toBe('2024-01-15');
        });

        it('should format with different format patterns', () => {
            vi.stubGlobal('window', undefined);
            const result1 = formatDateLanguage(testDate1, 'dd/MM/yyyy');
            expect(result1).toBe('15/01/2024');

            const result2 = formatDateLanguage(testDate1, 'MMM dd, yyyy');
            expect(result2).toContain('2024');

            const result3 = formatDateLanguage(testDate1, 'EEEE, MMMM d, yyyy');
            expect(result3).toContain('2024');
        });
    });

    describe('formatDate', () => {
        it('should format Date object (server-side, defaults to es)', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDate(testDate1);
            // PPP format should give long date format
            expect(result).toContain('2024');
        });

        it('should format string date (server-side, defaults to es)', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDate(testDateString1);
            expect(result).toContain('2024');
        });
    });

    describe('formatDistanceToNowLocale', () => {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        it('should format distance to now in Spanish by default (server-side)', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDistanceToNowLocale(twoDaysAgo);
            expect(result).toContain('hace 2 días');
        });

        it('should format distance to now in English when language is en', () => {
            vi.stubGlobal('window', {});
            const i18n = require('i18next');
            i18n.language = 'en';
            const result = formatDistanceToNowLocale(twoDaysAgo);
            expect(result).toContain('2 days ago');
        });

        it('should format distance to now in Catalan when language is ca', () => {
            vi.stubGlobal('window', {});
            const i18n = require('i18next');
            i18n.language = 'ca';
            const result = formatDistanceToNowLocale(twoDaysAgo);
            expect(result).toContain('fa 2 dies');
        });

        it('should handle string inputs', () => {
            vi.stubGlobal('window', undefined);
            const result = formatDistanceToNowLocale(twoDaysAgo.toISOString());
            expect(result).toContain('hace 2 días');
        });
    });
});

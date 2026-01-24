import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    formatDateRange,
    formatDateLanguage,
    formatDate,
    locales,
} from '@/app/utils/date-utils';

describe('date-utils', () => {
    // Mock dates for consistent testing
    const testDate1 = new Date('2024-01-15T12:00:00Z');
    const testDate2 = new Date('2024-01-20T12:00:00Z');
    const testDateString1 = '2024-01-15T12:00:00Z';
    const testDateString2 = '2024-01-20T12:00:00Z';

    describe('locales', () => {
        it('should export locales object with es, en, and ca', () => {
            expect(locales).toHaveProperty('es');
            expect(locales).toHaveProperty('en');
            expect(locales).toHaveProperty('ca');
        });
    });

    describe('formatDateRange', () => {
        beforeEach(() => {
            // Mock server-side rendering (no window)
            vi.stubGlobal('window', undefined);
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('should format date range when dates are different (server-side, defaults to es)', () => {
            const result = formatDateRange(testDate1, testDate2);
            // For Spanish locale, format should be dd/MM/yyyy
            expect(result).toContain('15/01/2024');
            expect(result).toContain('20/01/2024');
            expect(result).toContain(' - ');
        });

        it('should format same day dates as single date (server-side, defaults to es)', () => {
            const sameDay1 = new Date('2024-01-15T08:00:00Z');
            const sameDay2 = new Date('2024-01-15T18:00:00Z');
            const result = formatDateRange(sameDay1, sameDay2);
            // Should format as a single date
            expect(result).not.toContain(' - ');
            expect(result).toContain('2024');
        });

        it('should accept string inputs for dates', () => {
            const result = formatDateRange(testDateString1, testDateString2);
            expect(result).toContain('15/01/2024');
            expect(result).toContain('20/01/2024');
            expect(result).toContain(' - ');
        });

        it('should accept mixed Date and string inputs', () => {
            const result1 = formatDateRange(testDate1, testDateString2);
            expect(result1).toContain('15/01/2024');
            expect(result1).toContain('20/01/2024');

            const result2 = formatDateRange(testDateString1, testDate2);
            expect(result2).toContain('15/01/2024');
            expect(result2).toContain('20/01/2024');
        });
    });

    describe('formatDateLanguage', () => {
        beforeEach(() => {
            // Mock server-side rendering (no window)
            vi.stubGlobal('window', undefined);
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('should format date with custom format string (server-side, defaults to es)', () => {
            const result = formatDateLanguage(testDate1, 'yyyy-MM-dd');
            expect(result).toBe('2024-01-15');
        });

        it('should format date with PPP format (server-side, defaults to es)', () => {
            const result = formatDateLanguage(testDate1, 'PPP');
            // PPP format gives long date format
            expect(result).toContain('2024');
        });

        it('should accept string input for date', () => {
            const result = formatDateLanguage(testDateString1, 'yyyy-MM-dd');
            expect(result).toBe('2024-01-15');
        });

        it('should format with different format patterns', () => {
            const result1 = formatDateLanguage(testDate1, 'dd/MM/yyyy');
            expect(result1).toBe('15/01/2024');

            const result2 = formatDateLanguage(testDate1, 'MMM dd, yyyy');
            expect(result2).toContain('2024');

            const result3 = formatDateLanguage(testDate1, 'EEEE, MMMM d, yyyy');
            expect(result3).toContain('2024');
        });
    });

    describe('formatDate', () => {
        beforeEach(() => {
            // Mock server-side rendering (no window)
            vi.stubGlobal('window', undefined);
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('should format Date object (server-side, defaults to es)', () => {
            const result = formatDate(testDate1);
            // PPP format should give long date format
            expect(result).toContain('2024');
        });

        it('should format string date (server-side, defaults to es)', () => {
            const result = formatDate(testDateString1);
            expect(result).toContain('2024');
        });

        it('should parse and format various date strings', () => {
            const dateString1 = '2024-06-15';
            const result1 = formatDate(dateString1);
            expect(result1).toContain('2024');

            const dateString2 = '2024-12-25T00:00:00Z';
            const result2 = formatDate(dateString2);
            expect(result2).toContain('2024');
        });
    });
});

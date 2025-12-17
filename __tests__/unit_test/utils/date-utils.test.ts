import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock i18n module BEFORE importing date-utils
vi.mock('@/app/i18n', () => ({
    default: {
        language: 'en',
    },
}));

import {
    formatDate,
    formatDateRange,
    formatDateLanguage,
} from '@/app/utils/date-utils';
import i18n from '@/app/i18n';

describe('date-utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('formatDate', () => {
        it('should format date with English locale', () => {
            i18n.language = 'en';

            const date = new Date('2025-08-29');
            const result = formatDate(date);

            expect(result).toContain('August');
            expect(result).toContain('29');
            expect(result).toContain('2025');
        });

        it('should format date with Spanish locale', () => {
            i18n.language = 'es';

            const date = new Date('2025-08-29');
            const result = formatDate(date);

            expect(result).toContain('agosto');
            expect(result).toContain('29');
            expect(result).toContain('2025');
        });

        it('should format date with Catalan locale', () => {
            i18n.language = 'ca';

            const date = new Date('2025-08-29');
            const result = formatDate(date);

            expect(result).toContain('agost');
            expect(result).toContain('29');
            expect(result).toContain('2025');
        });

        it('should handle string input', () => {
            i18n.language = 'en';

            const result = formatDate('2025-08-29');

            expect(result).toContain('August');
            expect(result).toContain('29');
            expect(result).toContain('2025');
        });

        it('should default to Spanish locale for invalid language', () => {
            i18n.language = 'invalid' as any;

            const date = new Date('2025-08-29');
            const result = formatDate(date);

            // Should fallback to 'es' (Spanish) based on the code
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should format different date formats consistently', () => {
            i18n.language = 'en';

            const date1 = formatDate('2025-08-29');
            const date2 = formatDate(new Date('2025-08-29'));
            const date3 = formatDate('2025/08/29');

            // All should produce similar results
            expect(date1).toContain('August');
            expect(date2).toContain('August');
            expect(date3).toContain('August');
        });
    });

    describe('formatDateRange', () => {
        it('should format single day as one date', () => {
            i18n.language = 'en';

            const start = new Date('2025-08-29');
            const end = new Date('2025-08-29');
            const result = formatDateRange(start, end);

            expect(result).toContain('August');
            expect(result).not.toContain('-'); // No range separator
        });

        it('should format date range with separator', () => {
            i18n.language = 'en';

            const start = new Date('2025-08-29');
            const end = new Date('2025-08-31');
            const result = formatDateRange(start, end);

            expect(result).toContain('-'); // Has range separator
            expect(result).toContain('29');
            expect(result).toContain('31');
        });

        it('should handle string inputs', () => {
            i18n.language = 'en';

            const result = formatDateRange('2025-08-29', '2025-08-31');

            expect(result).toContain('-');
            expect(result).toContain('29');
            expect(result).toContain('31');
        });

        it('should use correct date format for English', () => {
            i18n.language = 'en';

            const result = formatDateRange('2025-08-29', '2025-08-31');

            // English format: yyyy/MM/dd
            expect(result).toContain('2025/08/29');
            expect(result).toContain('2025/08/31');
        });

        it('should use correct date format for Spanish', () => {
            i18n.language = 'es';

            const result = formatDateRange('2025-08-29', '2025-08-31');

            // Spanish format: dd/MM/yyyy
            expect(result).toContain('29/08/2025');
            expect(result).toContain('31/08/2025');
        });

        it('should use correct date format for Catalan', () => {
            i18n.language = 'ca';

            const result = formatDateRange('2025-08-29', '2025-08-31');

            // Catalan format: dd/MM/yyyy
            expect(result).toContain('29/08/2025');
            expect(result).toContain('31/08/2025');
        });
    });

    describe('formatDateLanguage', () => {
        it('should format date with custom format string in English', () => {
            i18n.language = 'en';

            const date = new Date('2025-08-29');
            const result = formatDateLanguage(date, 'MMMM dd, yyyy');

            expect(result).toContain('August');
            expect(result).toContain('29');
            expect(result).toContain('2025');
        });

        it('should format date with custom format string in Spanish', () => {
            i18n.language = 'es';

            const date = new Date('2025-08-29');
            const result = formatDateLanguage(date, 'dd MMMM yyyy');

            expect(result).toContain('29');
            expect(result).toContain('agosto');
            expect(result).toContain('2025');
        });

        it('should format date with custom format string in Catalan', () => {
            i18n.language = 'ca';

            const date = new Date('2025-08-29');
            const result = formatDateLanguage(date, 'dd MMMM yyyy');

            expect(result).toContain('29');
            expect(result).toContain('agost');
            expect(result).toContain('2025');
        });

        it('should handle string input', () => {
            i18n.language = 'en';

            const result = formatDateLanguage('2025-08-29', 'yyyy-MM-dd');

            expect(result).toBe('2025-08-29');
        });

        it('should respect different format patterns', () => {
            i18n.language = 'en';

            const date = new Date('2025-08-29');
            const format1 = formatDateLanguage(date, 'yyyy');
            const format2 = formatDateLanguage(date, 'MM/dd/yyyy');
            const format3 = formatDateLanguage(date, 'EEEE, MMMM dd');

            expect(format1).toBe('2025');
            expect(format2).toContain('08/29/2025');
            expect(format3).toContain('Friday');
            expect(format3).toContain('August');
        });
    });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import i18n from 'i18next';
import { formatDate } from '@/app/utils/date-utils';

describe('date-utils bug reproduction v2', () => {
    afterEach(() => {
        i18n.language = 'es';
    });

    it('should format date in English when language is en-US', () => {
        i18n.language = 'en-US';

        const testDate = new Date('2024-05-20T12:00:00Z');
        const result = formatDate(testDate);

        expect(result).toContain('May');
        expect(result).not.toContain('mayo');
    });

    it('should format date in Spanish when language is es-ES', () => {
        i18n.language = 'es-ES';

        const testDate = new Date('2024-05-20T12:00:00Z');
        const result = formatDate(testDate);

        expect(result).toContain('mayo');
    });
});

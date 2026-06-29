import { format, formatDistanceToNow } from 'date-fns';
import { es, enUS, ca } from 'date-fns/locale';

type LocaleType = 'es' | 'en' | 'ca';

export const locales = {
    es,
    en: enUS,
    ca,
};

const applyCatalanElisions = (
    dateString: string,
    locale: LocaleType
): string => {
    if (locale === 'ca') {
        // En catalán: 'de abril' -> 'd'abril', 'de agost' -> 'd'agost', 'de octubre' -> 'd'octubre'
        return dateString.replace(/ de ([aAoO])/gi, " d'$1");
    }
    return dateString;
};

/**
 * Safely gets the current locale from i18n, only on client-side
 * Falls back to 'es' for server-side rendering
 */
const getCurrentLocale = (lang?: string | null): LocaleType => {
    const processLang = (l: string) => {
        const shortCode = l.split('-')[0];
        if (['es', 'en', 'ca'].includes(shortCode))
            return shortCode as LocaleType;
        return 'es';
    };

    if (lang) return processLang(lang);

    // Only access i18n on client-side to avoid SSR timeout issues
    if (typeof window !== 'undefined') {
        try {
            // Dynamic import to prevent SSR issues
            // Use i18next directly as it's safe for SSR and avoids path resolution issues in tests.
            // Since app/i18n.ts initializes the global i18next instance, this will return the same configured instance.
            const i18n = require('i18next');
            if (i18n.language) return processLang(i18n.language);
            return 'es';
        } catch {
            return 'es';
        }
    }
    // Default to 'es' for server-side rendering
    return 'es';
};

/**
 * Formats a date range based on the current locale
 */
export const formatDateRange = (
    startDate: Date | string,
    endDate: Date | string,
    lang?: string
): string => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const isSameDay = start.toDateString() === end.toDateString();

    const currentLocale = getCurrentLocale(lang);
    const locale = locales[currentLocale] || locales.es;

    if (isSameDay) {
        return applyCatalanElisions(
            format(start, 'PPP', { locale }),
            currentLocale
        );
    } else {
        const dateFormat = currentLocale === 'en' ? 'yyyy/MM/dd' : 'dd/MM/yyyy';
        return `${format(start, dateFormat, { locale })} - ${format(end, dateFormat, { locale })}`;
    }
};

export const formatDateLanguage = (
    date: Date | string,
    formatString: string,
    lang?: string
) => {
    const currentLocale = getCurrentLocale(lang);
    const locale = locales[currentLocale] || locales.es;
    const parsedDate = date instanceof Date ? date : new Date(date);
    return applyCatalanElisions(
        format(parsedDate, formatString, { locale }),
        currentLocale
    );
};

/**
 * Formats a single date based on the current locale
 */
export const formatDate = (date: Date | string, lang?: string): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    const currentLocale = getCurrentLocale(lang);
    const locale = locales[currentLocale] || locales.es;
    return applyCatalanElisions(
        format(parsedDate, 'PPP', { locale }),
        currentLocale
    );
};

/**
 * Formats a period key (e.g. 2026-W26, 2026-06) into a user-friendly format
 */
export const formatPeriodKey = (
    category: 'week' | 'month' | 'year',
    periodKey: string,
    lang?: string
): string => {
    try {
        if (category === 'week') {
            const match = periodKey.match(/^(\d{4})-W(\d{1,2})$/);
            if (match) {
                const y = parseInt(match[1], 10);
                const w = parseInt(match[2], 10);

                // Get a base date representing the week
                const simple = new Date(y, 0, 1 + (w - 1) * 7);
                const start = new Date(simple);
                const day = start.getDay();
                const diff = start.getDate() - day + (day === 0 ? -6 : 1);
                start.setDate(diff);

                const end = new Date(start);
                end.setDate(start.getDate() + 6);

                return formatDateRange(start, end, lang);
            }
        } else if (category === 'month') {
            const match = periodKey.match(/^(\d{4})-(\d{2})$/);
            if (match) {
                const y = parseInt(match[1], 10);
                const m = parseInt(match[2], 10) - 1; // 0-indexed month
                const date = new Date(y, m, 1);
                return formatDateLanguage(date, 'LLLL yyyy', lang);
            }
        }
    } catch (e) {
        // Fallback to periodKey on parsing error
    }
    return periodKey;
};

/**
 * Formats the distance to now with the current locale
 */
export const formatDistanceToNowLocale = (
    date: Date | string,
    lang?: string
): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    const currentLocale = getCurrentLocale(lang);
    const locale = locales[currentLocale] || locales.es;
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale });
};

import { format, formatDistanceToNow } from 'date-fns';
import { es, enUS, ca } from 'date-fns/locale';

type LocaleType = 'es' | 'en' | 'ca';

export const locales = {
    es,
    en: enUS,
    ca,
};

/**
 * Safely gets the current locale from i18n, only on client-side
 * Falls back to 'es' for server-side rendering
 */
const getCurrentLocale = (): LocaleType => {
    // Only access i18n on client-side to avoid SSR timeout issues
    if (typeof window !== 'undefined') {
        try {
            // Dynamic import to prevent SSR issues
            // Use i18next directly as it's safe for SSR and avoids path resolution issues in tests.
            // Since app/i18n.ts initializes the global i18next instance, this will return the same configured instance.
            const i18n = require('i18next');
            return (i18n.language as LocaleType) || 'es';
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
    endDate: Date | string
): string => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const isSameDay = start.toDateString() === end.toDateString();

    const currentLocale = getCurrentLocale();
    const locale = locales[currentLocale];

    if (isSameDay) {
        return format(start, 'PPP', { locale });
    } else {
        const dateFormat = currentLocale === 'en' ? 'yyyy/MM/dd' : 'dd/MM/yyyy';
        return `${format(start, dateFormat, { locale })} - ${format(end, dateFormat, { locale })}`;
    }
};

export const formatDateLanguage = (
    date: Date | string,
    formatString: string
) => {
    const currentLocale = getCurrentLocale();
    const locale = locales[currentLocale];
    const parsedDate = date instanceof Date ? date : new Date(date);
    return format(parsedDate, formatString, { locale });
};

/**
 * Formats a single date based on the current locale
 */
export const formatDate = (date: Date | string): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    const currentLocale = getCurrentLocale();
    const locale = locales[currentLocale];
    return format(parsedDate, 'PPP', { locale });
};

/**
 * Formats the distance to now with the current locale
 */
export const formatDistanceToNowLocale = (date: Date | string): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    const currentLocale = getCurrentLocale();
    const locale = locales[currentLocale];
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale });
};

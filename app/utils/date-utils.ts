import { format, formatDistanceToNow } from 'date-fns';
import { es, enUS, ca } from 'date-fns/locale';
import i18n from 'i18next';

type LocaleType = 'es' | 'en' | 'ca';

export const locales = {
    es,
    en: enUS,
    ca,
};

/**
 * Safely gets the current locale from i18n.
 * This works on both client and server as long as i18next is initialized.
 */
const getCurrentLocale = (): LocaleType => {
    const lang = i18n.language || 'es';

    // Extract base language (e.g., 'en' from 'en-US')
    const baseLang = lang.split('-')[0].toLowerCase();

    // Check if it's a supported locale
    if (baseLang === 'en') return 'en';
    if (baseLang === 'ca') return 'ca';

    // Default to 'es'
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

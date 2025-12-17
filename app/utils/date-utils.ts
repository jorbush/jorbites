import { format } from 'date-fns';
import { es, enUS, ca } from 'date-fns/locale';
import i18n from '@/app/i18n';

type LocaleType = 'es' | 'en' | 'ca';

export const locales = {
    es,
    en: enUS,
    ca,
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

    const currentLocale = (i18n.language as LocaleType) || 'es';
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
    const currentLocale = (i18n.language as LocaleType) || 'es';
    const locale = locales[currentLocale];
    const parsedDate = date instanceof Date ? date : new Date(date);
    return format(parsedDate, formatString, { locale });
};

/**
 * Formats a single date based on the current locale
 */
export const formatDate = (date: Date | string): string => {
    const parsedDate = date instanceof Date ? date : new Date(date);
    const currentLocale = (i18n.language as LocaleType) || 'es';
    const locale = locales[currentLocale];
    return format(parsedDate, 'PPP', { locale });
};

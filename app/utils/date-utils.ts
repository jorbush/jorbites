import { format, utcToZonedTime } from 'date-fns-tz';
import { es, ca, enGB as en } from 'date-fns/locale';

const locales: { [key: string]: Locale } = {
    es,
    ca,
    en,
};

export const formatDate = (
    date: Date | string,
    formatStr: string,
    timeZone: string = 'UTC'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = utcToZonedTime(dateObj, timeZone);
    return format(zonedDate, formatStr, { timeZone });
};

export const formatDateLanguage = (
    date: Date | string,
    formatStr: string,
    language: string = 'en',
    timeZone: string = 'UTC'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = utcToZonedTime(dateObj, timeZone);
    const locale = locales[language] || en;
    return format(zonedDate, formatStr, { timeZone, locale });
};

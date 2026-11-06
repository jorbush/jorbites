'use client';

import React from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameDay,
    isWithinInterval,
    eachDayOfInterval,
} from 'date-fns';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import Tooltip from '@/app/components/utils/Tooltip';
import { Event } from '@/app/utils/markdownUtils';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import useIsMounted from '@/app/hooks/useIsMounted';

interface EventCalendarProps {
    currentEvents: Event[];
    upcomingEvents: Event[];
}

const EventCalendar: React.FC<EventCalendarProps> = ({
    currentEvents,
    upcomingEvents,
}) => {
    const { t } = useTranslation();
    const isMounted = useIsMounted();
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const allEvents = [...currentEvents, ...upcomingEvents];

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const daysOfWeek = [
        t('day_mon'),
        t('day_tue'),
        t('day_wed'),
        t('day_thu'),
        t('day_fri'),
        t('day_sat'),
        t('day_sun'),
    ];

    const monthName = t(`month_${format(currentMonth, 'MMM').toLowerCase()}`);
    const year = format(currentMonth, 'yyyy');

    const getEventsForDay = (day: Date) => {
        return allEvents.filter((event) => {
            // Permanent events don't show on the calendar as specific dates usually
            if (event.frontmatter.permanent) return false;

            // Recurrent events
            if (event.frontmatter.recurrent && event.frontmatter.dayOfMonth) {
                return day.getDate() === event.frontmatter.dayOfMonth;
            }

            const start = new Date(event.frontmatter.date);
            const end = new Date(event.frontmatter.endDate);

            // Ensure dates are valid
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

            return (
                isWithinInterval(day, { start, end }) ||
                isSameDay(day, start) ||
                isSameDay(day, end)
            );
        });
    };

    const todayDate = isMounted ? new Date() : null;

    return (
        <div className="mb-10 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-800/90">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-100">
                    {monthName} {year}
                </h2>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-600 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-200/70 sm:size-9 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/60"
                        aria-label="Previous Month"
                    >
                        <MdChevronLeft
                            size={22}
                            className="text-neutral-600 dark:text-neutral-300"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-600 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-200/70 sm:size-9 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/60"
                        aria-label="Next Month"
                    >
                        <MdChevronRight
                            size={22}
                            className="text-neutral-600 dark:text-neutral-300"
                        />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {daysOfWeek.map((day) => (
                    <div
                        key={day}
                        className="pb-2 text-center text-xs font-semibold text-neutral-500 uppercase md:text-sm dark:text-neutral-400"
                    >
                        {day}
                    </div>
                ))}

                {calendarDays.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameDay(
                        startOfMonth(day),
                        monthStart
                    );
                    const isToday = todayDate
                        ? isSameDay(day, todayDate)
                        : false;

                    return (
                        <div
                            key={format(day, 'yyyy-MM-dd')}
                            suppressHydrationWarning
                            className={`relative h-auto min-h-[64px] rounded-xl border p-1 transition-colors duration-200 md:min-h-[104px] md:p-2 ${
                                isCurrentMonth
                                    ? 'border-neutral-200/60 bg-white hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-900/60 dark:hover:border-neutral-600'
                                    : 'border-transparent bg-neutral-50/50 text-neutral-300 dark:bg-neutral-900/20 dark:text-neutral-600'
                            } ${isToday ? 'ring-green-450 ring-2' : ''}`}
                        >
                            <span
                                suppressHydrationWarning
                                className={`text-xs font-medium md:text-sm ${
                                    isToday
                                        ? 'dark:text-green-450 font-bold text-neutral-900'
                                        : 'text-neutral-700 dark:text-neutral-300'
                                }`}
                            >
                                {format(day, 'd')}
                            </span>

                            <div className="mt-1 flex flex-wrap gap-0.5 sm:gap-1">
                                {dayEvents.map((event) => (
                                    <Tooltip
                                        key={event.slug}
                                        text={event.frontmatter.title}
                                    >
                                        <Link
                                            href={`/events/${event.slug}`}
                                            className="cursor-pointer"
                                            prefetch={false}
                                        >
                                            <div className="group border-green-450/70 relative size-5 overflow-hidden rounded-full border bg-neutral-100 shadow-xs sm:size-6 md:size-8 dark:bg-neutral-800">
                                                <Image
                                                    src={
                                                        event.frontmatter
                                                            .badge ||
                                                        event.frontmatter.image
                                                    }
                                                    alt={
                                                        event.frontmatter.title
                                                    }
                                                    fill
                                                    sizes="(max-width: 640px) 20px, (max-width: 768px) 24px, 32px"
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-neutral-950 opacity-0 transition-opacity group-hover:opacity-20" />
                                            </div>
                                        </Link>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EventCalendar;

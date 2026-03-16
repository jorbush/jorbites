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

interface EventCalendarProps {
    currentEvents: Event[];
    upcomingEvents: Event[];
}

const EventCalendar: React.FC<EventCalendarProps> = ({
    currentEvents,
    upcomingEvents,
}) => {
    const { t } = useTranslation();
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

    return (
        <div className="mb-10 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold md:text-2xl dark:text-neutral-100">
                    {monthName} {year}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="cursor-pointer rounded-full p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        aria-label="Previous Month"
                    >
                        <MdChevronLeft
                            size={24}
                            className="dark:text-neutral-400"
                        />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="cursor-pointer rounded-full p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        aria-label="Next Month"
                    >
                        <MdChevronRight
                            size={24}
                            className="dark:text-neutral-400"
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
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={format(day, 'yyyy-MM-dd')}
                            className={`relative min-h-[60px] rounded-lg border p-1 transition-all md:min-h-[100px] md:p-2 ${
                                isCurrentMonth
                                    ? 'border-neutral-100 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                                    : 'border-transparent bg-neutral-50 text-neutral-300 dark:bg-neutral-950 dark:text-neutral-600'
                            } ${isToday ? 'ring-green-450 ring-2' : ''}`}
                        >
                            <span
                                className={`text-xs font-medium md:text-sm ${
                                    isToday
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-neutral-700 dark:text-neutral-300'
                                }`}
                            >
                                {format(day, 'd')}
                            </span>

                            <div className="mt-1 flex flex-wrap gap-1">
                                {dayEvents.map((event, eventIdx) => (
                                    <Tooltip
                                        key={eventIdx}
                                        text={event.frontmatter.title}
                                    >
                                        <Link
                                            href={`/events/${event.slug}`}
                                            className="cursor-pointer"
                                            prefetch={false}
                                        >
                                            <div className="group border-green-450 relative h-6 w-6 overflow-hidden rounded-full border md:h-8 md:w-8">
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
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-20" />
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

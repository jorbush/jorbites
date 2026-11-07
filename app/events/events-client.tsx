'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetcher';
import { categorizeEvents, sortEventsByDate } from '@/app/utils/markdownUtils';
import EventsList from '@/app/components/events/EventsList';
import { EventCardSkeleton } from '@/app/components/events/EventCard';
import useTheme from '@/app/hooks/useTheme';
import WeeklyChallenge from '@/app/components/events/WeeklyChallenge';
import { FcIdea } from 'react-icons/fc';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import EventCalendar from '@/app/components/events/EventCalendar';
import { SafeWeeklyChallenge } from '@/app/types';
import TopRecipeVoting from '@/app/components/events/TopRecipeVoting';
import TopRecipeResult from '@/app/components/events/TopRecipeResult';
import { CMS_EVENTS_URL } from '@/app/utils/constants';

interface EventsClientProps {
    weeklyChallenge: SafeWeeklyChallenge | null;
}

const EventsClient: React.FC<EventsClientProps> = ({ weeklyChallenge }) => {
    const { t, i18n } = useTranslation();

    useTheme();

    const { data: weekVoteData, mutate: mutateWeek } = useSWR(
        '/api/top-recipe-vote?category=week',
        fetcher
    );
    const { data: monthVoteData, mutate: mutateMonth } = useSWR(
        '/api/top-recipe-vote?category=month',
        fetcher
    );
    const { data: yearVoteData, mutate: mutateYear } = useSWR(
        '/api/top-recipe-vote?category=year',
        fetcher
    );

    const { data: eventsData, isLoading } = useSWR(
        `/api/events?lang=${i18n.language || 'en'}`,
        fetcher
    );

    const events = useMemo(() => {
        if (!eventsData) {
            return {
                current: [],
                upcoming: [],
                past: [],
                permanent: [],
            };
        }
        const categorized = categorizeEvents(eventsData);
        return {
            current: sortEventsByDate(categorized.current),
            upcoming: sortEventsByDate(categorized.upcoming, true), // true for ascending (soonest first)
            past: sortEventsByDate(categorized.past),
            permanent: categorized.permanent,
        };
    }, [eventsData]);

    const loading = isLoading;

    return (
        <Container>
            <div className="px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3.5">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                            <FcIdea size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                {t('events')}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {t('events_description')}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:block md:shrink-0">
                        <a
                            href={CMS_EVENTS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                            data-testid="propose-event-button"
                        >
                            <FiCalendar size={18} />
                            <span>{t('propose_event', 'Propose Event')}</span>
                        </a>
                    </div>
                </div>

                <WeeklyChallenge challenge={weeklyChallenge} />

                {/* Top Recipe of the Week */}
                {weekVoteData?.session &&
                    (weekVoteData.session.status === 'voting' ? (
                        <TopRecipeVoting
                            category="week"
                            session={weekVoteData.session}
                            userVote={weekVoteData.userVote}
                            mutate={mutateWeek}
                        />
                    ) : (
                        <TopRecipeResult
                            category="week"
                            session={weekVoteData.session}
                        />
                    ))}

                {/* Top Recipe of the Month */}
                {monthVoteData?.session &&
                    (monthVoteData.session.status === 'voting' ? (
                        <TopRecipeVoting
                            category="month"
                            session={monthVoteData.session}
                            userVote={monthVoteData.userVote}
                            mutate={mutateMonth}
                        />
                    ) : (
                        <TopRecipeResult
                            category="month"
                            session={monthVoteData.session}
                        />
                    ))}

                {/* Top Recipe of the Year */}
                {yearVoteData?.session &&
                    (yearVoteData.session.status === 'voting' ? (
                        <TopRecipeVoting
                            category="year"
                            session={yearVoteData.session}
                            userVote={yearVoteData.userVote}
                            mutate={mutateYear}
                        />
                    ) : (
                        <TopRecipeResult
                            category="year"
                            session={yearVoteData.session}
                        />
                    ))}

                <EventCalendar
                    currentEvents={events.current}
                    upcomingEvents={events.upcoming}
                />

                {loading ? (
                    <>
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="mb-10"
                            >
                                <h2 className="mb-5 text-2xl font-semibold dark:text-neutral-100">
                                    <span className="sr-only">
                                        {t('loading') || 'Loading…'}
                                    </span>
                                    <div
                                        className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                                        aria-hidden="true"
                                    ></div>
                                </h2>
                                <div className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-6 pb-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="min-w-[280px] flex-shrink-0 sm:min-w-[320px] md:min-w-[350px]"
                                        >
                                            <EventCardSkeleton />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <EventsList
                            events={events.current}
                            title={t('current_events') || 'Current Events'}
                            emptyMessage={
                                t('no_current_events') ||
                                'No current events found'
                            }
                            priority={true}
                        />

                        <EventsList
                            events={events.upcoming}
                            title={t('upcoming_events') || 'Upcoming Events'}
                            emptyMessage={
                                t('no_upcoming_events') ||
                                'No upcoming events found'
                            }
                            priority={true}
                        />

                        <EventsList
                            events={events.permanent}
                            title={t('permanent_events') || 'Permanent Events'}
                            emptyMessage={
                                t('no_permanent_events') ||
                                'No permanent events found'
                            }
                        />

                        <EventsList
                            events={events.past}
                            title={t('past_events') || 'Past Events'}
                            emptyMessage={
                                t('no_past_events') || 'No past events found'
                            }
                        />
                    </>
                )}
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <a
                href={CMS_EVENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={String(t('propose_event', 'Propose Event'))}
                aria-label={String(t('propose_event', 'Propose Event'))}
                className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                data-testid="propose-event-fab"
            >
                <FiPlus size={24} />
            </a>
        </Container>
    );
};

export default EventsClient;

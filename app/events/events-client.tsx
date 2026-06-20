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
import SectionHeader from '@/app/components/utils/SectionHeader';
import EventCalendar from '@/app/components/events/EventCalendar';
import { SafeWeeklyChallenge } from '@/app/types';
import TopRecipeVoting from '@/app/components/events/TopRecipeVoting';
import TopRecipeResult from '@/app/components/events/TopRecipeResult';

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
                <SectionHeader
                    icon={FcIdea}
                    title={`${t('events')}`}
                    description={t('events_description')}
                />

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
                                    <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
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
                        />

                        <EventsList
                            events={events.upcoming}
                            title={t('upcoming_events') || 'Upcoming Events'}
                            emptyMessage={
                                t('no_upcoming_events') ||
                                'No upcoming events found'
                            }
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
        </Container>
    );
};

export default EventsClient;

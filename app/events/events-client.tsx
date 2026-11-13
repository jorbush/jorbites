'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetcher';
import {
    categorizeEvents,
    sortEventsByDate,
    Event,
} from '@/app/utils/markdownUtils';
import EventsList from '@/app/components/events/EventsList';
import { EventCardSkeleton } from '@/app/components/events/EventCard';
import useTheme from '@/app/hooks/useTheme';
import WeeklyChallenge from '@/app/components/events/WeeklyChallenge';
import { FcIdea } from 'react-icons/fc';
import { FiCalendar, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import EventCalendar from '@/app/components/events/EventCalendar';
import { SafeWeeklyChallenge } from '@/app/types';
import TopRecipeVoting from '@/app/components/events/TopRecipeVoting';
import TopRecipeResult from '@/app/components/events/TopRecipeResult';
import { CMS_EVENTS_URL } from '@/app/utils/constants';
import {
    TopRecipeSessionsMap,
    TopRecipeVoteData,
} from '@/app/actions/top-recipe-vote';

interface EventsClientProps {
    weeklyChallenge: SafeWeeklyChallenge | null;
    initialTopRecipes?: TopRecipeSessionsMap;
}

interface CategorizedEvents {
    current: Event[];
    upcoming: Event[];
    past: Event[];
    permanent: Event[];
}

const EMPTY_EVENTS: CategorizedEvents = {
    current: [],
    upcoming: [],
    past: [],
    permanent: [],
};

const useCategorizedEvents = (language: string) => {
    const { data: eventsData, isLoading } = useSWR(
        `/api/events?lang=${language || 'en'}`,
        fetcher
    );

    const events = useMemo(() => {
        if (!eventsData) {
            return EMPTY_EVENTS;
        }
        const categorized = categorizeEvents(eventsData);
        return {
            current: sortEventsByDate(categorized.current),
            upcoming: sortEventsByDate(categorized.upcoming, true),
            past: sortEventsByDate(categorized.past),
            permanent: categorized.permanent,
        };
    }, [eventsData]);

    return { events, loading: isLoading };
};

interface TopRecipeSectionProps {
    category: 'week' | 'month' | 'year';
    initialData?: TopRecipeVoteData | null;
}

const TopRecipeSection: React.FC<TopRecipeSectionProps> = ({
    category,
    initialData,
}) => {
    const { data: voteData, mutate } = useSWR(
        `/api/top-recipe-vote?category=${category}`,
        fetcher,
        {
            fallbackData: initialData ?? undefined,
            revalidateOnMount: !initialData,
        }
    );

    if (!voteData?.session) return null;

    if (voteData.session.status === 'voting') {
        return (
            <TopRecipeVoting
                category={category}
                session={voteData.session}
                userVote={voteData.userVote}
                mutate={mutate}
            />
        );
    }

    return (
        <TopRecipeResult
            category={category}
            session={voteData.session}
        />
    );
};

interface EventsHeaderProps {
    title: string;
    description: string;
    proposeLabel: string;
}

const EventsHeader: React.FC<EventsHeaderProps> = ({
    title,
    description,
    proposeLabel,
}) => (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                <FcIdea size={28} />
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                    {title}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
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
                <span>{proposeLabel}</span>
            </a>
        </div>
    </div>
);

interface EventsMobileFabProps {
    label: string;
}

const EventsMobileFab: React.FC<EventsMobileFabProps> = ({ label }) => (
    <a
        href={CMS_EVENTS_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        aria-label={label}
        className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        data-testid="propose-event-fab"
    >
        <FiPlus size={24} />
    </a>
);

const EventsLoadingSkeleton: React.FC = () => {
    const { t } = useTranslation();

    return (
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
                    <div className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:px-3">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="w-[80vw] max-w-[300px] flex-shrink-0 sm:w-[320px] sm:max-w-none md:w-[350px]"
                            >
                                <EventCardSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
};

interface EventsSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    clearLabel: string;
}

const EventsSearchBar: React.FC<EventsSearchBarProps> = ({
    value,
    onChange,
    placeholder,
    clearLabel,
}) => (
    <div className="mb-6 flex justify-end">
        <div className="relative w-full sm:max-w-xs">
            <label
                htmlFor="events-search-input"
                className="sr-only"
            >
                {placeholder}
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <FiSearch className="size-4 text-neutral-400" />
            </div>
            <input
                id="events-search-input"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-xl border border-neutral-200/80 bg-white/80 py-2 pr-9 pl-10 text-sm text-neutral-900 shadow-2xs transition-colors duration-200 outline-none placeholder:text-neutral-400 focus:ring-2 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:text-white dark:placeholder:text-neutral-500"
                data-testid="events-search-input"
                aria-label={placeholder}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-1 text-neutral-400 transition-colors duration-200 hover:text-neutral-600 dark:hover:text-neutral-200"
                    aria-label={clearLabel}
                    data-testid="events-search-clear"
                >
                    <FiX className="size-4" />
                </button>
            )}
        </div>
    </div>
);

interface EmptySearchResultsProps {
    onClearSearch?: () => void;
}

const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
    onClearSearch,
}) => {
    const { t } = useTranslation();

    return (
        <div
            className="rounded-2xl border border-neutral-200/80 bg-white/80 px-6 py-10 text-center dark:border-neutral-800/80 dark:bg-neutral-900/60"
            data-testid="events-search-empty"
        >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {String(
                    t(
                        'no_events_matching_search',
                        'No events match your search'
                    )
                )}
            </p>
            {onClearSearch && (
                <button
                    type="button"
                    onClick={onClearSearch}
                    className="mt-3 cursor-pointer text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
                >
                    {String(t('clear_search', 'Clear search'))}
                </button>
            )}
        </div>
    );
};

interface EventsCategoriesListsProps {
    events: CategorizedEvents;
    isSearching?: boolean;
    onClearSearch?: () => void;
}

const EventsCategoriesLists: React.FC<EventsCategoriesListsProps> = ({
    events,
    isSearching = false,
    onClearSearch,
}) => {
    const { t } = useTranslation();

    const sections = [
        {
            key: 'current',
            items: events.current,
            title: String(t('current_events', 'Current Events')),
            emptyMessage: String(
                t('no_current_events', 'No current events found')
            ),
            priority: true,
        },
        {
            key: 'upcoming',
            items: events.upcoming,
            title: String(t('upcoming_events', 'Upcoming Events')),
            emptyMessage: String(
                t('no_upcoming_events', 'No upcoming events found')
            ),
            priority: true,
        },
        {
            key: 'permanent',
            items: events.permanent,
            title: String(t('permanent_events', 'Permanent Events')),
            emptyMessage: String(
                t('no_permanent_events', 'No permanent events found')
            ),
            priority: false,
        },
        {
            key: 'past',
            items: events.past,
            title: String(t('past_events', 'Past Events')),
            emptyMessage: String(t('no_past_events', 'No past events found')),
            priority: false,
        },
    ];

    const visibleSections = isSearching
        ? sections.filter((section) => section.items.length > 0)
        : sections;

    if (isSearching && visibleSections.length === 0) {
        return <EmptySearchResults onClearSearch={onClearSearch} />;
    }

    return (
        <>
            {visibleSections.map((section) => (
                <EventsList
                    key={section.key}
                    events={section.items}
                    title={section.title}
                    emptyMessage={section.emptyMessage}
                    priority={section.priority}
                />
            ))}
        </>
    );
};

const filterEventsByQuery = (events: Event[], query: string): Event[] => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return events;

    return events.filter((event) => {
        const title = event.frontmatter.title?.toLowerCase() ?? '';
        const description = event.frontmatter.description?.toLowerCase() ?? '';
        return title.includes(normalized) || description.includes(normalized);
    });
};

const EventsClient: React.FC<EventsClientProps> = ({
    weeklyChallenge,
    initialTopRecipes,
}) => {
    const { t, i18n } = useTranslation();
    useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const { events, loading } = useCategorizedEvents(i18n.language);

    const isSearching = searchQuery.trim().length > 0;

    const filteredEvents = useMemo(() => {
        if (!isSearching) return events;
        return {
            current: filterEventsByQuery(events.current, searchQuery),
            upcoming: filterEventsByQuery(events.upcoming, searchQuery),
            permanent: filterEventsByQuery(events.permanent, searchQuery),
            past: filterEventsByQuery(events.past, searchQuery),
        };
    }, [events, searchQuery, isSearching]);

    return (
        <Container>
            <div className="px-4 py-8">
                <EventsHeader
                    title={`${t('events')}`}
                    description={t('events_description')}
                    proposeLabel={String(t('propose_event', 'Propose Event'))}
                />

                <WeeklyChallenge challenge={weeklyChallenge} />

                <TopRecipeSection
                    category="week"
                    initialData={initialTopRecipes?.week}
                />
                <TopRecipeSection
                    category="month"
                    initialData={initialTopRecipes?.month}
                />
                <TopRecipeSection
                    category="year"
                    initialData={initialTopRecipes?.year}
                />

                <EventCalendar
                    currentEvents={events.current}
                    upcomingEvents={events.upcoming}
                />

                {!loading && (
                    <EventsSearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={String(
                            t('search_events', 'Search events...')
                        )}
                        clearLabel={String(t('clear_search', 'Clear search'))}
                    />
                )}

                {loading ? (
                    <EventsLoadingSkeleton />
                ) : (
                    <EventsCategoriesLists
                        events={filteredEvents}
                        isSearching={isSearching}
                        onClearSearch={() => setSearchQuery('')}
                    />
                )}
            </div>

            <EventsMobileFab
                label={String(t('propose_event', 'Propose Event'))}
            />
        </Container>
    );
};

export default EventsClient;

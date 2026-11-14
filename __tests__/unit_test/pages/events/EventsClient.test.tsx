import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EventsClient from '@/app/events/events-client';

vi.mock('swr', () => ({
    default: () => ({
        data: [],
        isLoading: false,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => fallback ?? key,
        i18n: { language: 'en' },
    }),
}));

vi.mock('@/app/hooks/useTheme', () => ({
    default: () => {},
}));

vi.mock('@/app/utils/markdownUtils', () => ({
    categorizeEvents: () => ({
        current: [],
        upcoming: [],
        past: [],
        permanent: [],
    }),
    sortEventsByDate: (items: unknown[]) => items,
}));

vi.mock('@/app/components/events/WeeklyChallenge', () => ({
    default: () => <div data-testid="weekly-challenge" />,
}));

vi.mock('@/app/components/events/EventCalendar', () => ({
    default: () => <div data-testid="event-calendar" />,
}));

vi.mock('@/app/components/events/EventsList', () => ({
    default: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/app/components/events/TopRecipeVoting', () => ({
    default: () => <div data-testid="top-recipe-voting" />,
}));

vi.mock('@/app/components/events/TopRecipeResult', () => ({
    default: () => <div data-testid="top-recipe-result" />,
}));

describe('<EventsClient />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders search input with text-base on mobile to prevent tap zoom and md:text-sm on desktop', () => {
        render(<EventsClient weeklyChallenge={null} />);

        const searchInput = screen.getByTestId('events-search-input');
        expect(searchInput.classList.contains('text-base')).toBe(true);
        expect(searchInput.classList.contains('md:text-sm')).toBe(true);
    });
});

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorDisplay from '@/app/components/utils/ErrorDisplay';
import React from 'react';

const refreshMock = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: refreshMock,
    }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock ClientOnly to immediately render children in test environment
vi.mock('@/app/components/utils/ClientOnly', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('<ErrorDisplay />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders heading and default error message', () => {
        render(
            <ErrorDisplay
                code="500"
                message="Internal Server Error"
            />
        );

        expect(screen.getByText('something_went_wrong')).toBeDefined();
        expect(screen.getByText('error')).toBeDefined();
        expect(screen.getByRole('button', { name: 'reload' })).toBeDefined();
    });

    it('renders 429 status code message', () => {
        render(
            <ErrorDisplay
                code="429"
                message="Too Many Requests"
            />
        );

        expect(screen.getByText('too_many_requests')).toBeDefined();
    });

    it('renders 404 status code message', () => {
        render(
            <ErrorDisplay
                code="404"
                message="Not Found"
            />
        );

        expect(screen.getByText('not_found')).toBeDefined();
    });

    it('renders 403 status code message', () => {
        render(
            <ErrorDisplay
                code="403"
                message="Forbidden"
            />
        );

        expect(screen.getByText('forbidden')).toBeDefined();
    });

    it('renders rate limit raw message if it starts with "You have made too many requests"', () => {
        const customMessage =
            'You have made too many requests. Please try again in 1 minute.';
        render(
            <ErrorDisplay
                code="429"
                message={customMessage}
            />
        );

        expect(screen.getByText(customMessage)).toBeDefined();
    });

    it('calls refresh when reload button is clicked', () => {
        render(
            <ErrorDisplay
                code="500"
                message="Failed to fetch"
            />
        );

        const reloadButton = screen.getByRole('button', { name: 'reload' });
        fireEvent.click(reloadButton);

        expect(refreshMock).toHaveBeenCalledTimes(1);
    });
});

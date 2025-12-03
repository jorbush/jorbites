import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';
import { SafeUser } from '@/app/types';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

vi.mock('date-fns-tz', () => ({
    utcToZonedTime: (date: Date) => date,
    format: (date: Date, format: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
    }),
}));

vi.mock('@/app/components/profile/ContributionGraph', () => ({
    __esModule: true,
    default: () => <div data-testid="contribution-graph"></div>,
}));

vi.mock('react-github-calendar', () => ({
    __esModule: true,
    default: () => <div data-testid="github-calendar"></div>,
}));

const mockUser: SafeUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    level: 5,
    badges: ['badge1', 'badge2'],
    verified: true,
};

const mockContributionData = [
    { date: '2025-01-01', count: 1, level: 1 },
    { date: '2025-01-02', count: 2, level: 2 },
];

describe('ProfileHeader', () => {
    beforeEach(() => {
        render(
            <ProfileHeader
                user={mockUser}
                contributionData={mockContributionData}
            />
        );
    });

    afterEach(() => {
        cleanup();
    });

    it('renders user information correctly', () => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('level 5')).toBeInTheDocument();
        expect(screen.getByText(/since/)).toBeInTheDocument();
        expect(screen.getByAltText('badge1 badge')).toBeInTheDocument();
        expect(screen.getByAltText('badge2 badge')).toBeInTheDocument();
    });

    it('renders the contribution graph', () => {
        expect(screen.getByTestId('contribution-graph')).toBeInTheDocument();
    });
});

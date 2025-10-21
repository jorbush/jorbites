import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkshopsClient from '@/app/workshops/WorkshopsClient';
import { SafeUser } from '@/app/types';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({}),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useWorkshopModal', () => ({
    default: () => ({ onOpen: vi.fn() }),
}));

vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => ({ onOpen: vi.fn() }),
}));

vi.mock('@/app/components/workshops/WorkshopList', () => ({
    default: () => <div>WorkshopList</div>,
}));

describe('<WorkshopsClient />', () => {
    const mockUser: SafeUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: true,
        level: 1,
        verified: true,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const mockWorkshops = {
        upcoming: [
            {
                id: '1',
                title: 'Upcoming Workshop',
                date: new Date(Date.now() + 86400000).toISOString(),
                location: 'Upcoming Location',
                host: { name: 'Host1' },
            },
        ],
        past: [
            {
                id: '2',
                title: 'Past Workshop',
                date: new Date(Date.now() - 86400000).toISOString(),
                location: 'Past Location',
                host: { name: 'Host2' },
            },
        ],
    };

    beforeEach(() => {
        global.fetch = vi.fn((url) => {
            if (url.toString().includes('upcoming=true')) {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            data: { workshops: mockWorkshops.upcoming },
                        }),
                }) as any;
            }
            if (url.toString().includes('past=true')) {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            data: { workshops: mockWorkshops.past },
                        }),
                }) as any;
            }
            return Promise.resolve({
                json: () => Promise.resolve({ data: { workshops: [] } }),
            }) as any;
        });
    });

    it('renders workshops sections and workshops', async () => {
        render(<WorkshopsClient currentUser={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('upcoming_workshops')).toBeDefined();
            expect(screen.getByText('past_workshops')).toBeDefined();
        });
    });
});

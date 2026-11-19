import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkshopPage, {
    generateMetadata,
} from '@/app/workshops/[workshopId]/page';
import getWorkshopById from '@/app/actions/getWorkshopById';
import getCurrentUser from '@/app/actions/getCurrentUser';

vi.mock('@/app/actions/getWorkshopById', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/actions/getCurrentUser', () => ({
    default: vi.fn(),
}));

vi.mock('@/app/components/utils/ClientOnly', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}));

vi.mock('@/app/components/utils/EmptyState', () => ({
    default: ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div data-testid="empty-state">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

vi.mock('@/app/workshops/[workshopId]/WorkshopClient', () => ({
    default: ({ workshop }: { workshop: { title: string } }) => (
        <div data-testid="workshop-client">{workshop.title}</div>
    ),
}));

const privateWorkshop = {
    id: 'ws-private-1',
    title: 'Secret Chef Class',
    description: 'Confidential location and recipe',
    location: '123 Secret St',
    isPrivate: true,
    hostId: 'host-1',
    whitelistedUserIds: ['guest-1'],
    imageSrc: 'https://images.jorbites.com/secret.webp',
    date: '2026-12-01T18:00:00.000Z',
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    participants: [],
    host: { id: 'host-1', name: 'Host' },
};

describe('WorkshopDetailPage private access control', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('generateMetadata does not leak private workshop title or description', async () => {
        vi.mocked(getWorkshopById).mockResolvedValue(privateWorkshop as any);

        const metadata = await generateMetadata({
            params: Promise.resolve({ workshopId: 'ws-private-1' }),
        });

        expect(metadata.title).toBe('Private Workshop | Jorbites Workshops');
        expect(metadata.description).toBeUndefined();
        expect(metadata.openGraph).toBeUndefined();
    });

    it('blocks unauthenticated visitors from viewing a private workshop', async () => {
        vi.mocked(getWorkshopById).mockResolvedValue(privateWorkshop as any);
        vi.mocked(getCurrentUser).mockResolvedValue(null);

        const ui = await WorkshopPage({
            params: Promise.resolve({ workshopId: 'ws-private-1' }),
        });
        render(ui);

        expect(screen.getByText('Private Workshop')).toBeDefined();
        expect(screen.queryByTestId('workshop-client')).toBeNull();
    });

    it('blocks non-whitelisted authenticated users from viewing a private workshop', async () => {
        vi.mocked(getWorkshopById).mockResolvedValue(privateWorkshop as any);
        vi.mocked(getCurrentUser).mockResolvedValue({
            id: 'stranger-2',
        } as any);

        const ui = await WorkshopPage({
            params: Promise.resolve({ workshopId: 'ws-private-1' }),
        });
        render(ui);

        expect(screen.getByText('Private Workshop')).toBeDefined();
        expect(screen.queryByTestId('workshop-client')).toBeNull();
    });

    it('allows whitelisted users and the host to view a private workshop', async () => {
        vi.mocked(getWorkshopById).mockResolvedValue(privateWorkshop as any);
        vi.mocked(getCurrentUser).mockResolvedValue({ id: 'guest-1' } as any);

        const ui = await WorkshopPage({
            params: Promise.resolve({ workshopId: 'ws-private-1' }),
        });
        render(ui);

        expect(screen.getByTestId('workshop-client')).toBeDefined();
        expect(screen.getByText('Secret Chef Class')).toBeDefined();
    });
});

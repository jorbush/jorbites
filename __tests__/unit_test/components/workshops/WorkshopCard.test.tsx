import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WorkshopCard from '@/app/components/workshops/WorkshopCard';
import { SafeWorkshop, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock the Avatar component
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, size }: { src: string | null; size: number }) => (
        <div
            data-testid="avatar"
            data-src={src}
            data-size={size}
        >
            Avatar
        </div>
    ),
}));

// Mock CustomProxyImage
vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img
            data-testid="workshop-image"
            src={src}
            alt={alt}
        />
    ),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<WorkshopCard />', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday

    const mockWorkshop: SafeWorkshop = {
        id: '1',
        title: 'Test Workshop',
        description: 'Test Description',
        date: futureDate,
        location: 'Test Location',
        isRecurrent: false,
        recurrencePattern: null,
        isPrivate: false,
        whitelistedUserIds: [],
        imageSrc: '/test-image.jpg',
        price: 25.5,
        ingredients: ['ingredient1'],
        previousSteps: [],
        hostId: 'host1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        host: {
            id: 'host1',
            name: 'Test Host',
            email: 'host@example.com',
            emailVerified: null,
            image: '/host-image.jpg',
            hashedPassword: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favoriteIds: [],
            emailNotifications: false,
            level: 5,
            verified: true,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        },
        participants: [
            {
                id: 'p1',
                workshopId: '1',
                userId: 'user1',
                joinedAt: new Date().toISOString(),
            },
        ],
    };

    const mockUser: SafeUser = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favoriteIds: [],
        emailNotifications: false,
        level: 0,
        verified: false,
        badges: [],
        resetToken: null,
        resetTokenExpiry: null,
    };

    const mockRouter = {
        back: vi.fn(),
        push: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        cleanup();
    });

    it('renders workshop card with correct information', () => {
        render(
            <WorkshopCard
                data={mockWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('Test Workshop')).toBeDefined();
        expect(screen.getByText('Test Host')).toBeDefined();
        expect(screen.getByText('Test Location')).toBeDefined();
        expect(screen.getByText('1 participants')).toBeDefined();
    });

    it('displays price when workshop has a price', () => {
        render(
            <WorkshopCard
                data={mockWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText(/€25.50/)).toBeDefined();
    });

    it('does not display price for free workshops', () => {
        const freeWorkshop = { ...mockWorkshop, price: 0 };
        render(
            <WorkshopCard
                data={freeWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.queryByText(/€/)).toBeNull();
    });

    it('shows private workshop icon for private workshops', () => {
        const privateWorkshop = { ...mockWorkshop, isPrivate: true };
        render(
            <WorkshopCard
                data={privateWorkshop}
                currentUser={mockUser}
            />
        );

        const card = screen.getByTestId('workshop-card');
        expect(card).toBeDefined();
    });

    it('shows past workshop overlay for past workshops', () => {
        const pastWorkshop = { ...mockWorkshop, date: pastDate };
        render(
            <WorkshopCard
                data={pastWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('workshop_date_passed')).toBeDefined();
    });

    it('navigates to workshop detail page when clicked', () => {
        render(
            <WorkshopCard
                data={mockWorkshop}
                currentUser={mockUser}
            />
        );

        const card = screen.getByTestId('workshop-card');
        fireEvent.click(card);

        expect(mockRouter.push).toHaveBeenCalledWith('/workshops/1');
    });

    it('displays workshop image', () => {
        render(
            <WorkshopCard
                data={mockWorkshop}
                currentUser={mockUser}
            />
        );

        const image = screen.getByTestId('workshop-image');
        expect(image).toBeDefined();
        expect(image.getAttribute('src')).toBe('/test-image.jpg');
    });

    it('displays fallback image when no image provided', () => {
        const workshopNoImage = { ...mockWorkshop, imageSrc: null };
        render(
            <WorkshopCard
                data={workshopNoImage}
                currentUser={mockUser}
            />
        );

        const image = screen.getByTestId('workshop-image');
        expect(image.getAttribute('src')).toBe('/avocado.webp');
    });

    it('shows host avatar and name', () => {
        render(
            <WorkshopCard
                data={mockWorkshop}
                currentUser={mockUser}
            />
        );

        const avatar = screen.getByTestId('avatar');
        expect(avatar).toBeDefined();
        expect(avatar.getAttribute('data-src')).toBe('/host-image.jpg');
        expect(screen.getByText('Test Host')).toBeDefined();
    });

    it('renders correctly for first card (LCP optimization)', () => {
        render(
            <WorkshopCard
                data={mockWorkshop}
                currentUser={mockUser}
                isFirstCard={true}
            />
        );

        const container = screen.getByTestId('workshop-card');
        expect(container.getAttribute('id')).toBe('lcp-container');
    });
});

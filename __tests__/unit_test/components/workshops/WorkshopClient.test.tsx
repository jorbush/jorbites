import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopClient from '@/app/workshops/[workshopId]/WorkshopClient';
import { SafeWorkshop, SafeUser } from '@/app/types';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: () => ({}),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/workshops/WorkshopHead', () => ({
    default: () => <div data-testid="workshop-head">WorkshopHead</div>,
}));

vi.mock('@/app/components/workshops/WorkshopInfo', () => ({
    default: () => <div data-testid="workshop-info">WorkshopInfo</div>,
}));

vi.mock('@/app/components/workshops/JoinWorkshopButton', () => ({
    default: () => (
        <div data-testid="join-workshop-button">JoinWorkshopButton</div>
    ),
}));

vi.mock('@/app/components/workshops/EditWorkshopButton', () => ({
    default: () => (
        <div data-testid="edit-workshop-button">EditWorkshopButton</div>
    ),
}));

vi.mock('@/app/components/workshops/DeleteWorkshopButton', () => ({
    default: () => (
        <div data-testid="delete-workshop-button">DeleteWorkshopButton</div>
    ),
}));

describe('<WorkshopClient />', () => {
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

    const mockWorkshop: SafeWorkshop & { host: SafeUser } = {
        id: '1',
        title: 'Test Workshop',
        description: 'Test Description',
        date: new Date().toISOString(),
        location: 'Test Location',
        isRecurrent: false,
        recurrencePattern: null,
        isPrivate: false,
        whitelistedUserIds: [],
        imageSrc: '/test-image.jpg',
        price: 25.5,
        currency: 'EUR',
        ingredients: ['ingredient1'],
        previousSteps: [],
        hostId: '2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        host: {
            id: '2',
            name: 'Host User',
            email: 'host@example.com',
            emailVerified: null,
            image: null,
            hashedPassword: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favoriteIds: [],
            emailNotifications: false,
            level: 2,
            verified: true,
            badges: [],
            resetToken: null,
            resetTokenExpiry: null,
        },
        participants: [],
    };

    afterEach(cleanup);

    it('renders workshop details correctly', () => {
        render(
            <WorkshopClient
                workshop={mockWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByTestId('workshop-head')).toBeDefined();
        expect(screen.getByTestId('workshop-info')).toBeDefined();
        expect(screen.getByText('workshop_information_title')).toBeDefined();
        expect(screen.getByText(/participants_label/)).toBeDefined();
    });

    it('displays the price with currency', () => {
        render(
            <WorkshopClient
                workshop={mockWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText(/price_label EUR25.50/)).toBeDefined();
    });

    it('does not display the price for free workshops', () => {
        const freeWorkshop = { ...mockWorkshop, price: 0 };
        render(
            <WorkshopClient
                workshop={freeWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.queryByText('price_label')).toBeNull();
    });

    it('shows private workshop message if user is not whitelisted', () => {
        const privateWorkshop = {
            ...mockWorkshop,
            isPrivate: true,
            whitelistedUserIds: ['3'],
        };
        render(
            <WorkshopClient
                workshop={privateWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('private_workshop_title')).toBeDefined();
        expect(screen.getByText('private_workshop_message')).toBeDefined();
    });

    it('shows workshop content if user is whitelisted', () => {
        const privateWorkshop = {
            ...mockWorkshop,
            isPrivate: true,
            whitelistedUserIds: ['1'],
        };
        render(
            <WorkshopClient
                workshop={privateWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByTestId('workshop-head')).toBeDefined();
        expect(screen.getByTestId('workshop-info')).toBeDefined();
    });

    it('shows edit and delete buttons for the host', () => {
        render(
            <WorkshopClient
                workshop={mockWorkshop}
                currentUser={mockWorkshop.host}
            />
        );

        expect(screen.getByTestId('edit-workshop-button')).toBeDefined();
        expect(screen.getByTestId('delete-workshop-button')).toBeDefined();
    });

    it('shows join button for other users', () => {
        render(
            <WorkshopClient
                workshop={mockWorkshop}
                currentUser={mockUser}
            />
        );

        expect(screen.getByTestId('join-workshop-button')).toBeDefined();
    });
});

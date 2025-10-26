import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditWorkshopButton from '@/app/components/workshops/EditWorkshopButton';
import { SafeWorkshop } from '@/app/types';
import useWorkshopModal from '@/app/hooks/useWorkshopModal';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useWorkshopModal');

vi.mock('@/app/components/buttons/Button', () => ({
    default: ({
        label,
        onClick,
    }: {
        label: string;
        onClick: () => void;
    }) => (
        <button onClick={onClick} data-testid="edit-button">
            {label}
        </button>
    ),
}));

describe('<EditWorkshopButton />', () => {
    const mockWorkshop: SafeWorkshop = {
        id: 'workshop1',
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
        ingredients: ['ingredient1', 'ingredient2'],
        previousSteps: ['step1', 'step2'],
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
        participants: [],
    };

    const mockOnOpenEdit = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useWorkshopModal as any).mockReturnValue({
            onOpenEdit: mockOnOpenEdit,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders edit button with correct label', () => {
        render(<EditWorkshopButton workshop={mockWorkshop} />);

        expect(screen.getByText('edit_workshop')).toBeDefined();
    });

    it('opens workshop modal with edit data when clicked', () => {
        render(<EditWorkshopButton workshop={mockWorkshop} />);

        const button = screen.getByTestId('edit-button');
        fireEvent.click(button);

        expect(mockOnOpenEdit).toHaveBeenCalledWith({
            id: mockWorkshop.id,
            title: mockWorkshop.title,
            description: mockWorkshop.description,
            date: mockWorkshop.date,
            location: mockWorkshop.location,
            isRecurrent: mockWorkshop.isRecurrent,
            recurrencePattern: mockWorkshop.recurrencePattern,
            isPrivate: mockWorkshop.isPrivate,
            whitelistedUserIds: mockWorkshop.whitelistedUserIds,
            imageSrc: mockWorkshop.imageSrc,
            price: mockWorkshop.price,
            ingredients: mockWorkshop.ingredients,
            previousSteps: mockWorkshop.previousSteps,
        });
    });

    it('passes all necessary workshop data to modal', () => {
        render(<EditWorkshopButton workshop={mockWorkshop} />);

        const button = screen.getByTestId('edit-button');
        fireEvent.click(button);

        expect(mockOnOpenEdit).toHaveBeenCalledTimes(1);
        const callArgs = mockOnOpenEdit.mock.calls[0][0];

        expect(callArgs.id).toBe(mockWorkshop.id);
        expect(callArgs.title).toBe(mockWorkshop.title);
        expect(callArgs.description).toBe(mockWorkshop.description);
        expect(callArgs.location).toBe(mockWorkshop.location);
        expect(callArgs.price).toBe(mockWorkshop.price);
        expect(callArgs.ingredients).toEqual(mockWorkshop.ingredients);
        expect(callArgs.previousSteps).toEqual(mockWorkshop.previousSteps);
    });

    it('handles workshop with null recurrencePattern', () => {
        const workshopWithNullRecurrence = {
            ...mockWorkshop,
            recurrencePattern: null,
        };

        render(<EditWorkshopButton workshop={workshopWithNullRecurrence} />);

        const button = screen.getByTestId('edit-button');
        fireEvent.click(button);

        const callArgs = mockOnOpenEdit.mock.calls[0][0];
        expect(callArgs.recurrencePattern).toBeNull();
    });

    it('handles workshop with empty arrays', () => {
        const workshopWithEmptyArrays = {
            ...mockWorkshop,
            ingredients: [],
            previousSteps: [],
            whitelistedUserIds: [],
        };

        render(<EditWorkshopButton workshop={workshopWithEmptyArrays} />);

        const button = screen.getByTestId('edit-button');
        fireEvent.click(button);

        const callArgs = mockOnOpenEdit.mock.calls[0][0];
        expect(callArgs.ingredients).toEqual([]);
        expect(callArgs.previousSteps).toEqual([]);
        expect(callArgs.whitelistedUserIds).toEqual([]);
    });

    it('handles private workshop with whitelisted users', () => {
        const privateWorkshop = {
            ...mockWorkshop,
            isPrivate: true,
            whitelistedUserIds: ['user1', 'user2', 'user3'],
        };

        render(<EditWorkshopButton workshop={privateWorkshop} />);

        const button = screen.getByTestId('edit-button');
        fireEvent.click(button);

        const callArgs = mockOnOpenEdit.mock.calls[0][0];
        expect(callArgs.isPrivate).toBe(true);
        expect(callArgs.whitelistedUserIds).toEqual(['user1', 'user2', 'user3']);
    });
});

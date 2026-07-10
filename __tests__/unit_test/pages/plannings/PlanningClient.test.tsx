import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlanningClient from '@/app/plannings/[planningId]/PlanningClient';
import { SafePlanning, SafeUser } from '@/app/types';
import axios from 'axios';

const mockShare = vi.fn();

vi.mock('axios');
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
    }),
}));
vi.mock('@/app/hooks/useShare', () => ({
    default: () => ({
        share: mockShare,
    }),
}));

const mockUser: SafeUser = {
    id: 'user-1',
    name: 'Jordi Chef',
    image: null,
    level: 1,
    verified: false,
    badges: [],
};

const mockPlanning: SafePlanning = {
    id: 'plan-1',
    name: 'Keto Week',
    description: 'Low carb planner',
    userId: 'user-1',
    isPrivate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: mockUser,
    meals: [],
};

describe('PlanningClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockShare.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders planning details and standard actions', () => {
        render(
            <PlanningClient
                planning={mockPlanning}
                currentUser={mockUser}
            />
        );

        expect(screen.getByText('Keto Week')).toBeDefined();
        expect(screen.getByText('Low carb planner')).toBeDefined();

        // Check action buttons exist
        expect(screen.getByTestId('shopping-list-button')).toBeDefined();
        expect(screen.getByTestId('export-calendar-button')).toBeDefined();
        expect(screen.getByTestId('share-button')).toBeDefined();
    });

    it('renders correct lock icon based on privacy settings', () => {
        const { unmount } = render(
            <PlanningClient
                planning={{ ...mockPlanning, isPrivate: true }}
                currentUser={mockUser}
            />
        );
        expect(screen.getByTestId('lock-icon')).toBeDefined();
        expect(screen.queryByTestId('lock-open-icon')).toBeNull();

        unmount();

        render(
            <PlanningClient
                planning={{ ...mockPlanning, isPrivate: false }}
                currentUser={mockUser}
            />
        );
        expect(screen.getByTestId('lock-open-icon')).toBeDefined();
        expect(screen.queryByTestId('lock-icon')).toBeNull();
    });

    it('opens edit plan modal when clicking edit plan button (for owner)', async () => {
        render(
            <PlanningClient
                planning={mockPlanning}
                currentUser={mockUser}
            />
        );

        const editButton = screen.getByTestId('edit-plan-button');
        expect(editButton).toBeDefined();

        // Click Edit
        fireEvent.click(editButton);

        // Should render PlanningModal with title edit_plan now
        expect(screen.getByTestId('modal-title').textContent).toContain(
            'edit_plan'
        );
    });

    it('calls axios.patch when saving changes in edit plan modal', async () => {
        vi.mocked(axios.patch).mockResolvedValue({ data: {} });
        render(
            <PlanningClient
                planning={mockPlanning}
                currentUser={mockUser}
            />
        );

        // Click Edit
        fireEvent.click(screen.getByTestId('edit-plan-button'));

        // Click Save inside Modal
        const saveButton = screen.getByTestId('modal-action-button');
        await act(async () => {
            fireEvent.click(saveButton);
        });

        expect(axios.patch).toHaveBeenCalledWith('/api/plannings/plan-1', {
            name: 'Keto Week',
            description: 'Low carb planner',
            isPrivate: false,
            meals: [],
        });
    });

    it('shows add recipe buttons by default for the owner', () => {
        render(
            <PlanningClient
                planning={mockPlanning}
                currentUser={mockUser}
            />
        );

        const addButtons = screen.getAllByTestId('add-recipe-button');
        expect(addButtons.length).toBeGreaterThan(0);
    });

    it('hides add recipe and edit plan buttons and shows bookmark button for non-owner', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: {} });
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });

        const nonOwner: SafeUser = {
            id: 'user-2',
            name: 'Jordi Fan',
            image: null,
            level: 1,
            verified: false,
            badges: [],
            savedPlanningIds: [],
        };

        render(
            <PlanningClient
                planning={mockPlanning}
                currentUser={nonOwner}
            />
        );

        // No add recipe buttons
        expect(screen.queryByTestId('add-recipe-button')).toBeNull();
        // No edit plan button
        expect(screen.queryByTestId('edit-plan-button')).toBeNull();

        // Should show save plan bookmark button
        const savePlanButton = screen.getByTestId('save-plan-button');
        expect(savePlanButton).toBeDefined();

        // Click save plan (it is not saved initially, so should call POST)
        await act(async () => {
            fireEvent.click(savePlanButton);
        });
        expect(axios.post).toHaveBeenCalledWith('/api/saves/plan-1');
    });

    it('allows unsaving a plan for non-owner', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });

        const nonOwner: SafeUser = {
            id: 'user-2',
            name: 'Jordi Fan',
            image: null,
            level: 1,
            verified: false,
            badges: [],
            savedPlanningIds: ['plan-1'],
        };

        render(
            <PlanningClient
                planning={mockPlanning}
                currentUser={nonOwner}
            />
        );

        const savePlanButton = screen.getByTestId('save-plan-button');
        expect(savePlanButton).toBeDefined();

        // Click save plan (it is saved, so should call DELETE)
        await act(async () => {
            fireEvent.click(savePlanButton);
        });
        expect(axios.delete).toHaveBeenCalledWith('/api/saves/plan-1');
    });

    it('hides add recipe button when meal limit (4) is reached', () => {
        const fullMeals = [
            {
                id: '1',
                day: 'monday',
                mealType: 'breakfast',
                recipeId: 'r1',
                recipe: { title: 'R1', imageSrc: '' },
            },
            {
                id: '2',
                day: 'monday',
                mealType: 'breakfast',
                recipeId: 'r2',
                recipe: { title: 'R2', imageSrc: '' },
            },
            {
                id: '3',
                day: 'monday',
                mealType: 'breakfast',
                recipeId: 'r3',
                recipe: { title: 'R3', imageSrc: '' },
            },
            {
                id: '4',
                day: 'monday',
                mealType: 'breakfast',
                recipeId: 'r4',
                recipe: { title: 'R4', imageSrc: '' },
            },
        ];

        render(
            <PlanningClient
                planning={{ ...mockPlanning, meals: fullMeals }}
                currentUser={mockUser}
            />
        );

        // Find the "monday" heading
        const mondayHeading = screen.getByRole('heading', { name: /monday/i });
        const dayContainer = mondayHeading.closest('.rounded-3xl');

        // Find all meal slots in that day
        const mealSlots = dayContainer!.querySelectorAll(
            '[data-testid="meal-slot"]'
        );

        // Find the breakfast slot
        const breakfastSlot = Array.from(mealSlots).find((slot) =>
            slot.textContent?.toLowerCase().includes('breakfast')
        );

        expect(breakfastSlot).toBeDefined();
        const addButton = breakfastSlot!.querySelector(
            '[data-testid="add-recipe-button"]'
        );
        expect(addButton).toBeNull();
    });
});

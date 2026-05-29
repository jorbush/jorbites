import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlanningsClient from '@/app/plannings/PlanningsClient';
import { SafePlanning, SafeUser } from '@/app/types';
import axios from 'axios';

vi.mock('axios');
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
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

const mockPlannings: SafePlanning[] = [
    {
        id: 'plan-1',
        name: 'Keto Week',
        description: 'Low carb planner',
        userId: 'user-1',
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
        meals: [],
    },
];

describe('PlanningsClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders community planning list', () => {
        render(
            <PlanningsClient
                initialMyPlannings={[]}
                initialCommunityPlannings={mockPlannings}
                currentUser={null}
            />
        );
        expect(screen.getByText('meal_planner')).toBeDefined();
        expect(screen.getByText('Keto Week')).toBeDefined();
        expect(screen.getByText('Low carb planner')).toBeDefined();
    });

    it('opens create planning modal when click create button (if authenticated)', async () => {
        render(
            <PlanningsClient
                initialMyPlannings={[]}
                initialCommunityPlannings={[]}
                currentUser={mockUser}
            />
        );

        const createButton = screen.getByTestId('create-meal-plan-button');
        fireEvent.click(createButton);

        expect(screen.getByLabelText('plan_name')).toBeDefined();
        expect(screen.getByLabelText('plan_description')).toBeDefined();
    });

    it('submits planning request successfully', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { id: 'new-plan' } });

        render(
            <PlanningsClient
                initialMyPlannings={[]}
                initialCommunityPlannings={[]}
                currentUser={mockUser}
            />
        );

        // Open modal
        const createButton = screen.getByTestId('create-meal-plan-button');
        fireEvent.click(createButton);

        // Fill inputs
        const nameInput = screen.getByLabelText('plan_name');
        const descTextarea = screen.getByLabelText('plan_description');

        fireEvent.change(nameInput, {
            target: { value: 'My Muscle Gain Diet' },
        });
        fireEvent.change(descTextarea, {
            target: { value: 'High protein meals' },
        });

        const submitButton = screen.getByTestId('modal-action-button');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(axios.post).toHaveBeenCalledWith('/api/plannings', {
            name: 'My Muscle Gain Diet',
            description: 'High protein meals',
            isPrivate: true,
        });
    });
});

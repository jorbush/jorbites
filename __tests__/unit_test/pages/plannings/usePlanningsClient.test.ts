import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { usePlanningsClient } from '@/app/plannings/usePlanningsClient';
import { SafePlanning, SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';

vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

const mockLoginModal = {
    onOpen: vi.fn(),
};
vi.mock('@/app/hooks/useLoginModal', () => ({
    default: () => mockLoginModal,
}));

describe('usePlanningsClient hook', () => {
    const mockUser: SafeUser = {
        id: 'user-1',
        name: 'Chef Jordi',
        image: null,
        level: 1,
        verified: false,
        badges: [],
    };

    const mockPlanning1: SafePlanning = {
        id: 'plan-1',
        name: 'Plan 1',
        description: 'Desc 1',
        userId: 'user-1',
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
        meals: [],
    };

    const mockPlanning2: SafePlanning = {
        id: 'plan-2',
        name: 'Plan 2',
        description: 'Desc 2',
        userId: 'user-2',
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
        meals: [],
    };

    const myPlans = [mockPlanning1];
    const communityPlans = [mockPlanning2];
    const savedPlans = [mockPlanning1];
    const emptyPlans: SafePlanning[] = [];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('initializes default active tab based on currentUser', () => {
        const { result: withUser } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
                initialMyPlannings: myPlans,
            })
        );
        expect(withUser.current.activeTab).toBe('my');
        expect(withUser.current.tabs.length).toBe(3);

        const { result: withoutUser } = renderHook(() =>
            usePlanningsClient({
                currentUser: null,
                initialCommunityPlannings: communityPlans,
            })
        );
        expect(withoutUser.current.activeTab).toBe('community');
        expect(withoutUser.current.tabs.length).toBe(1);
    });

    it('returns appropriate activePlans when activeTab changes', () => {
        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
                initialMyPlannings: myPlans,
                initialCommunityPlannings: communityPlans,
                initialSavedPlannings: emptyPlans,
            })
        );

        expect(result.current.activePlans).toEqual(myPlans);

        act(() => {
            result.current.setActiveTab('community');
        });
        expect(result.current.activePlans).toEqual(communityPlans);

        act(() => {
            result.current.setActiveTab('saved');
        });
        expect(result.current.activePlans).toEqual([]);
    });

    it('handles create plan click requiring login if not authenticated', () => {
        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: null,
            })
        );

        act(() => {
            result.current.handleCreateClick();
        });

        expect(mockLoginModal.onOpen).toHaveBeenCalledTimes(1);
        expect(result.current.isCreateOpen).toBe(false);
    });

    it('opens create modal when authenticated', () => {
        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
            })
        );

        act(() => {
            result.current.handleCreateClick();
        });

        expect(mockLoginModal.onOpen).not.toHaveBeenCalled();
        expect(result.current.isCreateOpen).toBe(true);
    });

    it('handles onCreateSubmit successfully', async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({
            data: { id: 'new-plan-id' },
        });

        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
            })
        );

        await act(async () => {
            await result.current.onCreateSubmit({
                name: 'New Plan',
                description: 'Plan Desc',
                isPrivate: false,
            });
        });

        expect(axios.post).toHaveBeenCalledWith('/api/plannings', {
            name: 'New Plan',
            description: 'Plan Desc',
            isPrivate: false,
        });
        expect(toast.success).toHaveBeenCalledWith('meal_plan_created');
        expect(mockPush).toHaveBeenCalledWith('/plannings/new-plan-id');
        expect(mockRefresh).toHaveBeenCalled();
        expect(result.current.isCreateOpen).toBe(false);
    });

    it('handles onCreateSubmit failure with error toast', async () => {
        vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
            })
        );

        await act(async () => {
            await result.current.onCreateSubmit({
                name: 'New Plan',
                description: 'Plan Desc',
                isPrivate: false,
            });
        });

        expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        expect(result.current.isCreating).toBe(false);
    });

    it('handles onDelete successfully', async () => {
        vi.mocked(axios.delete).mockResolvedValueOnce({});

        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
                initialMyPlannings: myPlans,
            })
        );

        act(() => {
            result.current.setDeletePlanId('plan-1');
        });

        await act(async () => {
            await result.current.onDelete();
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/plannings/plan-1');
        expect(toast.success).toHaveBeenCalledWith('meal_plan_deleted');
        expect(result.current.deletePlanId).toBeNull();
        expect(result.current.myPlannings).toEqual([]);
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('handles onDelete failure with error toast', async () => {
        vi.mocked(axios.delete).mockRejectedValueOnce(
            new Error('Delete error')
        );

        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
                initialMyPlannings: myPlans,
            })
        );

        act(() => {
            result.current.setDeletePlanId('plan-1');
        });

        await act(async () => {
            await result.current.onDelete();
        });

        expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        expect(result.current.deletePlanId).toBeNull();
    });

    it('handles onUnsave successfully', async () => {
        vi.mocked(axios.delete).mockResolvedValueOnce({});

        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
                initialSavedPlannings: savedPlans,
            })
        );

        await act(async () => {
            await result.current.onUnsave('plan-1');
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/saves/plan-1');
        expect(toast.success).toHaveBeenCalledWith('meal_plan_updated');
        expect(result.current.savedPlannings).toEqual([]);
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('handles onUnsave failure with error toast', async () => {
        vi.mocked(axios.delete).mockRejectedValueOnce(
            new Error('Unsave error')
        );

        const { result } = renderHook(() =>
            usePlanningsClient({
                currentUser: mockUser,
                initialSavedPlannings: savedPlans,
            })
        );

        await act(async () => {
            await result.current.onUnsave('plan-1');
        });

        expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
    });

    it('syncs state when initial props update', () => {
        const updatedPlans = [mockPlanning2];
        const { result, rerender } = renderHook(
            ({ initialMyPlannings }) =>
                usePlanningsClient({
                    currentUser: mockUser,
                    initialMyPlannings,
                }),
            {
                initialProps: { initialMyPlannings: myPlans },
            }
        );

        expect(result.current.myPlannings).toEqual(myPlans);

        rerender({ initialMyPlannings: updatedPlans });

        expect(result.current.myPlannings).toEqual(updatedPlans);
    });
});

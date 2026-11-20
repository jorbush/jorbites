import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useQuestForm } from '@/app/components/modals/quest/useQuestForm';
import useQuestModal from '@/app/hooks/useQuestModal';

const mockOnClose = vi.fn();
const mockRefresh = vi.fn();
const mockPush = vi.fn();

vi.mock('axios');

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/app/hooks/useQuestModal', () => ({
    default: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: mockRefresh,
        push: mockPush,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('useQuestForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useQuestModal).mockReturnValue({
            isOpen: true,
            isEditMode: false,
            editQuestData: null,
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: vi.fn(),
            onClose: mockOnClose,
        });
    });

    it('returns create-mode labels and default status when not editing', () => {
        const { result } = renderHook(() => useQuestForm());

        expect(result.current.isOpen).toBe(true);
        expect(result.current.isEditMode).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.statusValue).toBe('open');
        expect(result.current.modalTitle).toBe('request_recipe');
        expect(result.current.modalSubtitle).toBe('request_recipe_subtitle');
        expect(result.current.actionLabel).toBe('create');
    });

    it('returns edit-mode labels and syncs editQuestData into form state', () => {
        vi.mocked(useQuestModal).mockReturnValue({
            isOpen: true,
            isEditMode: true,
            editQuestData: {
                id: 'quest-1',
                title: 'Ramen Quest',
                description: 'Spicy miso ramen',
                status: 'in_progress',
                recipes: [],
            },
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: vi.fn(),
            onClose: mockOnClose,
        });

        const { result } = renderHook(() => useQuestForm());

        expect(result.current.isEditMode).toBe(true);
        expect(result.current.statusValue).toBe('in_progress');
        expect(result.current.modalTitle).toBe('edit_quest');
        expect(result.current.modalSubtitle).toBe('edit_quest_subtitle');
        expect(result.current.actionLabel).toBe('update');
    });

    it('resets form values back to defaults when modal closes', () => {
        vi.mocked(useQuestModal).mockReturnValue({
            isOpen: true,
            isEditMode: true,
            editQuestData: {
                id: 'quest-1',
                title: 'Ramen Quest',
                description: 'Spicy miso ramen',
                status: 'completed',
            },
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: vi.fn(),
            onClose: mockOnClose,
        });

        const { result, rerender } = renderHook(() => useQuestForm());
        expect(result.current.statusValue).toBe('completed');

        vi.mocked(useQuestModal).mockReturnValue({
            isOpen: false,
            isEditMode: false,
            editQuestData: null,
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: vi.fn(),
            onClose: mockOnClose,
        });

        rerender();
        expect(result.current.statusValue).toBe('open');
    });

    it('creates a quest on submit and navigates to open quests', async () => {
        vi.mocked(axios.post).mockResolvedValueOnce({ data: { id: 'q-1' } });
        const { result } = renderHook(() => useQuestForm());

        await act(async () => {
            await result.current.handleFormSubmit();
        });

        expect(axios.post).toHaveBeenCalledWith('/api/quests', {
            title: '',
            description: '',
            status: 'open',
            recipeId: '',
        });
        expect(toast.success).toHaveBeenCalledWith('quest_created');
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/quests?status=open');
        expect(mockRefresh).toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);
    });

    it('updates an existing quest on submit without navigating', async () => {
        vi.mocked(axios.patch).mockResolvedValueOnce({ data: { id: 'q-1' } });
        vi.mocked(useQuestModal).mockReturnValue({
            isOpen: true,
            isEditMode: true,
            editQuestData: {
                id: 'q-1',
                title: 'Existing Quest',
                description: 'Existing description',
                status: 'in_progress',
            },
            onOpen: vi.fn(),
            onOpenCreate: vi.fn(),
            onOpenEdit: vi.fn(),
            onClose: mockOnClose,
        });

        const { result } = renderHook(() => useQuestForm());

        await act(async () => {
            await result.current.handleFormSubmit();
        });

        expect(axios.patch).toHaveBeenCalledWith('/api/quest/q-1', {
            title: 'Existing Quest',
            description: 'Existing description',
            status: 'in_progress',
            recipeId: '',
        });
        expect(toast.success).toHaveBeenCalledWith('quest_updated');
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);
    });

    it('shows API error toast or fallback message when submission rejects', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        vi.mocked(axios.post).mockRejectedValueOnce({
            response: { data: { error: 'Server validation failed' } },
        });

        const { result } = renderHook(() => useQuestForm());

        await act(async () => {
            await result.current.handleFormSubmit();
        });

        expect(toast.error).toHaveBeenCalledWith('Server validation failed');
        expect(mockOnClose).not.toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);

        vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network error'));

        await act(async () => {
            await result.current.handleFormSubmit();
        });

        expect(toast.error).toHaveBeenCalledWith('something_went_wrong');
        expect(result.current.isLoading).toBe(false);
        consoleSpy.mockRestore();
    });
});

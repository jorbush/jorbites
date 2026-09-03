import { renderHook, act } from '@testing-library/react';
import { useRecipeLock } from '@/app/hooks/useRecipeLock';
import axios from 'axios';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('axios');

describe('useRecipeLock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('cleans up lock on unmount using captured active field variable', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.get.mockResolvedValue({ data: {} });
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        mockedAxios.delete.mockResolvedValue({ data: { success: true } });

        const { result, rerender, unmount } = renderHook(
            ({ targetId, currentUserId }) =>
                useRecipeLock(targetId, currentUserId),
            {
                initialProps: {
                    targetId: 'recipe-123',
                    currentUserId: 'user-456',
                },
            }
        );

        await act(async () => {
            await result.current.acquire('title');
        });

        // Trigger effect re-run so activeField is captured by useEffect
        rerender({ targetId: 'recipe-123-updated', currentUserId: 'user-456' });

        unmount();

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/recipes/recipe-123/lock?field=title'
        );
    });

    it('automatically acquires activeField on mount and releases on unmount', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.get.mockResolvedValue({ data: {} });
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        mockedAxios.delete.mockResolvedValue({ data: { success: true } });

        const { unmount } = renderHook(() =>
            useRecipeLock('draft-789', 'user-101', 'step:1')
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/recipes/draft-789/lock',
            { field: 'step:1' }
        );

        unmount();

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/recipes/draft-789/lock?field=step%3A1'
        );
    });

    it('automatically releases previous lock and acquires new lock when activeField changes', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.get.mockResolvedValue({ data: {} });
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        mockedAxios.delete.mockResolvedValue({ data: { success: true } });

        const { rerender, unmount } = renderHook(
            ({ activeField }) =>
                useRecipeLock('draft-789', 'user-101', activeField),
            {
                initialProps: { activeField: 'step:1' },
            }
        );

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/recipes/draft-789/lock',
            { field: 'step:1' }
        );

        // Step changes from 1 to 2
        await act(async () => {
            rerender({ activeField: 'step:2' });
        });

        // Previous step 1 was released exactly once (C5)
        const deleteStep1Calls = mockedAxios.delete.mock.calls.filter((call) =>
            call[0].includes('field=step%3A1')
        );
        expect(deleteStep1Calls).toHaveLength(1);

        // New step 2 was acquired
        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/recipes/draft-789/lock',
            { field: 'step:2' }
        );

        unmount();

        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/recipes/draft-789/lock?field=step%3A2'
        );
    });

    it('releases lock with the captured targetId when targetId becomes null on modal close (C4)', async () => {
        const mockedAxios = vi.mocked(axios);
        mockedAxios.get.mockResolvedValue({ data: {} });
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        mockedAxios.delete.mockResolvedValue({ data: { success: true } });

        const { rerender } = renderHook(
            ({ targetId, activeField }) =>
                useRecipeLock(targetId, 'user-101', activeField),
            {
                initialProps: {
                    targetId: 'draft-modal-close' as string | null,
                    activeField: 'step:1' as string | null,
                },
            }
        );

        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/recipes/draft-modal-close/lock',
            { field: 'step:1' }
        );

        // Modal closes: targetId becomes null
        await act(async () => {
            rerender({ targetId: null, activeField: null });
        });

        // Must still delete lock with the previously held targetId!
        expect(mockedAxios.delete).toHaveBeenCalledWith(
            '/api/recipes/draft-modal-close/lock?field=step%3A1'
        );
    });
});

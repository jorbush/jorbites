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
            '/api/recipes/recipe-123-updated/lock?field=title'
        );
    });
});

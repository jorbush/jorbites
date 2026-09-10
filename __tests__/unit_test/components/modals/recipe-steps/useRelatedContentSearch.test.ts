import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRelatedContentSearch } from '@/app/components/modals/recipe-steps/useRelatedContentSearch';

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('useRelatedContentSearch', () => {
    const mockT = vi.fn((key: string) => key);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns empty results when search query is shorter than 2 chars', async () => {
        const { result } = renderHook(() =>
            useRelatedContentSearch('recipes', mockT)
        );

        act(() => {
            result.current.setSearchQuery('a');
        });

        await waitFor(() => {
            expect(result.current.searchResults).toEqual({
                recipes: [],
                quests: [],
            });
        });
        expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('searches for recipes when query length >= 2', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                recipes: [{ id: 'recipe-1', title: 'Pizza' }],
            },
        });

        const { result } = renderHook(() =>
            useRelatedContentSearch('recipes', mockT)
        );

        act(() => {
            result.current.setSearchQuery('pizza');
        });

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/search?q=pizza&type=recipes'
            );
        });

        await waitFor(() => {
            expect(result.current.searchResults.recipes).toHaveLength(1);
        });
    });

    it('searches for quests when type is quests', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                quests: [{ id: 'quest-1', title: 'Bake a cake' }],
            },
        });

        const { result } = renderHook(() =>
            useRelatedContentSearch('quests', mockT)
        );

        act(() => {
            result.current.setSearchQuery('cake');
        });

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/quests?status=open&q=cake'
            );
        });

        await waitFor(() => {
            expect(result.current.searchResults.quests).toHaveLength(1);
        });
    });

    it('shows toast error when search request fails', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() =>
            useRelatedContentSearch('recipes', mockT)
        );

        act(() => {
            result.current.setSearchQuery('pasta');
        });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('search_failed');
        });
    });
});

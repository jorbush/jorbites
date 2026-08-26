import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useRecentSearches from '@/app/hooks/useRecentSearches';

describe('useRecentSearches', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with empty array when no searches stored', () => {
        const { result } = renderHook(() => useRecentSearches('user123'));
        expect(result.current.recentSearches).toEqual([]);
    });

    it('should load existing recent searches from localStorage', () => {
        localStorage.setItem(
            'recent_searches_user123',
            JSON.stringify(['pizza', 'pasta'])
        );
        const { result } = renderHook(() => useRecentSearches('user123'));
        expect(result.current.recentSearches).toEqual(['pizza', 'pasta']);
    });

    it('should fallback to guest key when userId is not provided', () => {
        localStorage.setItem(
            'recent_searches_guest',
            JSON.stringify(['tacos'])
        );
        const { result } = renderHook(() => useRecentSearches(null));
        expect(result.current.recentSearches).toEqual(['tacos']);
    });

    it('should add new search queries to the front of the list', () => {
        const { result } = renderHook(() => useRecentSearches('user123'));

        act(() => {
            result.current.addRecentSearch('pizza');
        });

        expect(result.current.recentSearches).toEqual(['pizza']);

        act(() => {
            result.current.addRecentSearch('burger');
        });

        expect(result.current.recentSearches).toEqual(['burger', 'pizza']);
    });

    it('should deduplicate case-insensitively and move existing search to top', () => {
        const { result } = renderHook(() => useRecentSearches('user123'));

        act(() => {
            result.current.addRecentSearch('pizza');
            result.current.addRecentSearch('burger');
            result.current.addRecentSearch('PIZZA');
        });

        expect(result.current.recentSearches).toEqual(['PIZZA', 'burger']);
    });

    it('should ignore empty or whitespace-only search queries', () => {
        const { result } = renderHook(() => useRecentSearches('user123'));

        act(() => {
            result.current.addRecentSearch('   ');
            result.current.addRecentSearch('');
        });

        expect(result.current.recentSearches).toEqual([]);
    });

    it('should limit recent searches to a maximum of 10 items', () => {
        const { result } = renderHook(() => useRecentSearches('user123'));

        act(() => {
            for (let i = 1; i <= 15; i++) {
                result.current.addRecentSearch(`search_${i}`);
            }
        });

        expect(result.current.recentSearches.length).toBe(10);
        expect(result.current.recentSearches[0]).toBe('search_15');
        expect(result.current.recentSearches[9]).toBe('search_6');
    });

    it('should remove a single search query', () => {
        const { result } = renderHook(() => useRecentSearches('user123'));

        act(() => {
            result.current.addRecentSearch('pizza');
            result.current.addRecentSearch('pasta');
        });

        act(() => {
            result.current.removeRecentSearch('pizza');
        });

        expect(result.current.recentSearches).toEqual(['pasta']);
        expect(localStorage.getItem('recent_searches_user123')).toBe(
            JSON.stringify(['pasta'])
        );
    });

    it('should clear all recent searches', () => {
        const { result } = renderHook(() => useRecentSearches('user123'));

        act(() => {
            result.current.addRecentSearch('pizza');
            result.current.addRecentSearch('pasta');
        });

        act(() => {
            result.current.clearRecentSearches();
        });

        expect(result.current.recentSearches).toEqual([]);
        expect(localStorage.getItem('recent_searches_user123')).toBeNull();
    });
});

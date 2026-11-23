import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileTabs, getInitialTab } from '@/app/hooks/useProfileTabs';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, fallback?: string) => key || fallback,
    }),
}));

describe('useProfileTabs & getInitialTab', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getInitialTab', () => {
        it('returns blogs when tabParam is blogs or articles', () => {
            expect(getInitialTab('blogs')).toBe('blogs');
            expect(getInitialTab('articles')).toBe('blogs');
        });

        it('returns recipes when tabParam is recipes', () => {
            expect(getInitialTab('recipes')).toBe('recipes');
        });

        it('defaults to blogs when recipesCount is 0 and blogsCount > 0', () => {
            expect(getInitialTab(undefined, 0, 5)).toBe('blogs');
        });

        it('defaults to recipes when recipesCount > 0', () => {
            expect(getInitialTab(undefined, 3, 5)).toBe('recipes');
        });

        it('defaults to recipes when both counts are 0', () => {
            expect(getInitialTab(undefined, 0, 0)).toBe('recipes');
        });

        it('stays on recipes when searching yields 0 recipes even if blogsCount > 0', () => {
            expect(getInitialTab(undefined, 0, 5, true)).toBe('recipes');
        });
    });

    describe('useProfileTabs hook', () => {
        it('initializes with recipes tab by default', () => {
            const { result } = renderHook(() =>
                useProfileTabs({
                    tabParam: 'recipes',
                    recipesCount: 5,
                    blogsCount: 2,
                    showArticles: true,
                })
            );

            expect(result.current.activeTab).toBe('recipes');
            expect(result.current.tabs).toHaveLength(2);
        });

        it('falls back to recipes if articles are disabled and tabParam is blogs', () => {
            const { result } = renderHook(() =>
                useProfileTabs({
                    tabParam: 'blogs',
                    recipesCount: 5,
                    blogsCount: 2,
                    showArticles: false,
                })
            );

            expect(result.current.activeTab).toBe('recipes');
            expect(result.current.tabs).toHaveLength(1);
        });

        it('handles tab change and updates router search params', () => {
            const { result } = renderHook(() =>
                useProfileTabs({
                    tabParam: 'recipes',
                    recipesCount: 5,
                    blogsCount: 2,
                    showArticles: true,
                })
            );

            act(() => {
                result.current.handleTabChange('blogs');
            });

            expect(result.current.activeTab).toBe('blogs');
            expect(mockPush).toHaveBeenCalledWith('?tab=blogs', {
                scroll: false,
            });
        });

        it('prevents navigating to blogs when showArticles is false', () => {
            const { result } = renderHook(() =>
                useProfileTabs({
                    tabParam: 'recipes',
                    recipesCount: 5,
                    blogsCount: 2,
                    showArticles: false,
                })
            );

            act(() => {
                result.current.handleTabChange('blogs');
            });

            expect(result.current.activeTab).toBe('recipes');
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('includes lists, quests, and plannings tabs when enabled and supports switching', () => {
            const { result } = renderHook(() =>
                useProfileTabs({
                    tabParam: 'recipes',
                    recipesCount: 2,
                    blogsCount: 0,
                    listsCount: 1,
                    questsCount: 1,
                    planningsCount: 1,
                    showArticles: false,
                    showLists: true,
                    showQuests: true,
                    showPlannings: true,
                })
            );

            expect(result.current.tabs.map((tab) => tab.id)).toEqual([
                'recipes',
                'lists',
                'quests',
                'plannings',
            ]);

            act(() => {
                result.current.handleTabChange('quests');
            });

            expect(result.current.activeTab).toBe('quests');
            expect(mockPush).toHaveBeenCalledWith('?tab=quests', {
                scroll: false,
            });
        });

        it('falls back to recipes and prevents navigation when lists/quests/plannings are disabled', () => {
            const { result } = renderHook(() =>
                useProfileTabs({
                    tabParam: 'lists',
                    recipesCount: 2,
                    blogsCount: 0,
                    showArticles: false,
                    showLists: false,
                    showQuests: false,
                    showPlannings: false,
                })
            );

            expect(result.current.activeTab).toBe('recipes');

            act(() => {
                result.current.handleTabChange('plannings');
            });

            expect(result.current.isTabPending).toBe(false);
            expect(result.current.activeTab).toBe('recipes');
            expect(mockPush).not.toHaveBeenCalled();
        });
    });
});

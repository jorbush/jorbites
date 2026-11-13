import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNavbarSearch } from '@/app/components/navbar/useNavbarSearch';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import { usePathname } from 'next/navigation';

vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: vi.fn(() => false),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: vi.fn(() => '/'),
}));

describe('useNavbarSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams = new URLSearchParams();
        vi.mocked(usePathname).mockReturnValue('/');
        vi.mocked(useMediaQuery).mockReturnValue(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useNavbarSearch());
        expect(result.current.isSearchMode).toBe(false);
        expect(result.current.searchQuery).toBe('');
        expect(result.current.isFilterablePage).toBe(true);
        expect(result.current.filtersState.hasActive).toBe(false);
    });

    it('initializes in search mode when search param is present', () => {
        mockSearchParams.set('search', 'tacos');
        const onSearchModeChange = vi.fn();
        const { result } = renderHook(() =>
            useNavbarSearch({ onSearchModeChange })
        );
        expect(result.current.isSearchMode).toBe(true);
        expect(result.current.searchQuery).toBe('tacos');
        expect(onSearchModeChange).toHaveBeenCalledWith(true);
    });

    it('toggles search mode on and off', () => {
        const onSearchModeChange = vi.fn();
        const { result } = renderHook(() =>
            useNavbarSearch({ onSearchModeChange })
        );

        act(() => {
            result.current.handleSearchToggle();
        });
        expect(result.current.isSearchMode).toBe(true);
        expect(onSearchModeChange).toHaveBeenCalledWith(true);

        act(() => {
            result.current.handleSearchToggle();
        });
        expect(result.current.isSearchMode).toBe(false);
        expect(onSearchModeChange).toHaveBeenCalledWith(false);
    });

    it('submits search and updates URL query', () => {
        const { result } = renderHook(() => useNavbarSearch());

        act(() => {
            result.current.handleSearchChange('guacamole');
        });

        act(() => {
            result.current.handleSearchSubmit();
        });

        expect(mockReplace).toHaveBeenCalledWith('/?search=guacamole');
    });

    it('resets search on Escape key press', () => {
        const { result } = renderHook(() => useNavbarSearch());

        act(() => {
            result.current.handleSearchToggle();
        });
        expect(result.current.isSearchMode).toBe(true);

        act(() => {
            result.current.handleKeyDown({
                key: 'Escape',
            } as React.KeyboardEvent);
        });
        expect(result.current.isSearchMode).toBe(false);
    });

    it('detects active filters correctly', () => {
        mockSearchParams.set('minCalories', '200');
        const { result } = renderHook(() =>
            useNavbarSearch({ isFilterOpen: true })
        );
        expect(result.current.filtersState.hasActive).toBe(true);
        expect(result.current.filtersState.isOpen).toBe(true);
    });

    it('reflects non-filterable pages', () => {
        vi.mocked(usePathname).mockReturnValue('/recipes/456');
        const { result } = renderHook(() => useNavbarSearch());
        expect(result.current.isFilterablePage).toBe(false);
    });
});

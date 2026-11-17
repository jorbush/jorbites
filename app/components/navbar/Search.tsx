'use client';

import { Suspense } from 'react';
import DesktopSearch from './DesktopSearch';
import MobileSearch from './MobileSearch';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Logo from './Logo';
import { useNavbarSearch } from './useNavbarSearch';

export const SearchFallback = () => {
    return (
        <div className="flex flex-row items-center gap-1 md:gap-3">
            <Logo />
            <div className="bg-green-450/10 dark:bg-green-450/20 relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-2" />
        </div>
    );
};

interface SearchProps {
    onFilterToggle?: () => void;
    isFilterOpen?: boolean;
    onSearchModeChange?: (isSearchMode: boolean) => void;
}

const SearchComponent: React.FC<SearchProps> = ({
    onSearchModeChange,
    onFilterToggle,
    isFilterOpen,
}) => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const {
        isSearchMode,
        searchQuery,
        inputRef,
        isFilterablePage,
        isFiltering,
        hasActiveFilters,
        handleSearchSubmit,
        handleSearchToggle,
        handleSearchChange,
        handleKeyDown,
    } = useNavbarSearch({ onSearchModeChange });

    const filtersState = {
        isOpen: isFilterOpen,
        isFiltering,
        hasActive: hasActiveFilters,
    };

    const SearchView = isMobile ? MobileSearch : DesktopSearch;

    return (
        <SearchView
            isSearchMode={isSearchMode}
            searchQuery={searchQuery}
            onSearchToggle={handleSearchToggle}
            onSubmit={handleSearchSubmit}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            onFilterToggle={onFilterToggle}
            filtersState={filtersState}
            isFilterablePage={isFilterablePage}
            t={t}
        />
    );
};

const Search: React.FC<SearchProps> = (props) => (
    <Suspense fallback={<SearchFallback />}>
        <SearchComponent {...props} />
    </Suspense>
);

export default Search;

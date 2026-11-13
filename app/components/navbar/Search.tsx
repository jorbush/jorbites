'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import DesktopSearch from './DesktopSearch';
import MobileSearch from './MobileSearch';
import Logo from './Logo';
import { useNavbarSearch } from './useNavbarSearch';

export const SearchFallback = () => {
    const pathname = usePathname();
    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;

    return (
        <div className="flex flex-row items-center gap-1 md:gap-3">
            <Logo />
            {isFilterablePage && (
                <div className="bg-green-450/10 dark:bg-green-450/20 relative flex size-9 shrink-0 items-center justify-center rounded-full p-2 md:size-10" />
            )}
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
    const {
        isMobile,
        isSearchMode,
        searchQuery,
        inputRef,
        handleSearchToggle,
        handleSearchSubmit,
        handleSearchChange,
        handleKeyDown,
        filtersState,
        isFilterablePage,
        t,
    } = useNavbarSearch({ onSearchModeChange, isFilterOpen });

    const SearchTarget = isMobile ? MobileSearch : DesktopSearch;

    return (
        <SearchTarget
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

'use client';

import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import Container from '@/app/components/utils/Container';
import Categories from '@/app/components/navbar/Categories';
import Search from '@/app/components/navbar/Search';
import UserMenu from '@/app/components/navbar/UserMenu';
import { SafeUser } from '@/app/types';
import useTheme from '@/app/hooks/useTheme';
import useMediaQuery from '@/app/hooks/useMediaQuery';

interface NavbarProps {
    currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
    const [isSearchModeActive, setIsSearchModeActive] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const isMobile = useMediaQuery('(max-width: 880px)');
    const pathname = usePathname();
    useTheme();
    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;
    const isMobileSearchActive =
        isMobile && isFilterablePage && isSearchModeActive;

    const handleSearchModeChange = useCallback((isActive: boolean) => {
        setIsSearchModeActive(isActive);
    }, []);

    const toggleFilter = useCallback(() => {
        setIsFilterOpen((value) => {
            const newValue = !value;
            if (newValue) {
                setShouldRender(true);
            }
            return newValue;
        });
    }, []);

    const handleAnimationEnd = useCallback(() => {
        if (!isFilterOpen) {
            setShouldRender(false);
        }
    }, [isFilterOpen]);

    return (
        <header className="dark:bg-dark fixed z-10 w-full bg-white shadow-xs">
            <nav aria-label="Main navigation">
                <div className="border-b-[1px] py-3 sm:py-4">
                    <Container>
                        <div className="flex min-h-[48px] flex-row items-center justify-between gap-3 md:gap-0">
                            <Search
                                onSearchModeChange={handleSearchModeChange}
                                onFilterToggle={toggleFilter}
                                isFilterOpen={isFilterOpen}
                            />
                            {!isMobile ||
                            !isFilterablePage ||
                            (isMobile && !isMobileSearchActive) ? (
                                <UserMenu currentUser={currentUser} />
                            ) : (
                                /* Invisible spacer to maintain height when UserMenu is hidden */
                                <div className="min-h-[48px] w-0" />
                            )}
                        </div>
                    </Container>
                </div>
                {isFilterablePage && shouldRender && (
                    <div
                        className={`navbar-categories ${isFilterOpen ? 'open' : 'closing'}`}
                        id="categories-menu"
                        role="region"
                        aria-label="Categories filter"
                        aria-hidden={!isFilterOpen}
                        onAnimationEnd={handleAnimationEnd}
                    >
                        <Categories />
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;

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
        <header className="fixed top-0 right-0 left-0 z-20 w-full border-b border-neutral-200/40 bg-white/75 pt-[env(safe-area-inset-top,0px)] shadow-[0_2px_20px_rgba(0,0,0,0.03)] backdrop-blur-lg transition-all duration-300 dark:border-neutral-800/40 dark:bg-[#0F0F0F]/75 dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)]">
            <nav aria-label="Main navigation">
                <div
                    data-testid="navbar-top-row"
                    className="relative z-10 bg-transparent py-3 sm:py-4"
                >
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
                {/* Categories Row with its own liquid glass panel styling (75% opacity) */}
                {isFilterablePage && shouldRender && (
                    <div
                        className={`navbar-categories relative z-0 border-t border-neutral-200/40 bg-white/10 backdrop-blur-lg transition-all duration-300 dark:border-neutral-800/40 dark:bg-[#0F0F0F]/10 ${isFilterOpen ? 'open' : 'closing'}`}
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

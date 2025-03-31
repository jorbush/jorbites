'use client';

import { useCallback, useState } from 'react';
import Container from '@/app/components/utils/Container';
import Categories from '@/app/components/navbar/Categories';
import Search from '@/app/components/navbar/Search';
import UserMenu from '@/app/components/navbar/UserMenu';
import { SafeUser } from '@/app/types';
import useTheme from '@/app/hooks/useTheme';

interface NavbarProps {
    currentUser?: SafeUser | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    useTheme();

    const filterOpen = useCallback(() => {
        setIsFilterOpen((value) => !value);
    }, []);

    return (
        <header className="fixed z-10 w-full bg-white shadow-xs dark:bg-dark">
            <nav aria-label="Main navigation">
                <div className="border-b-[1px] py-3 sm:py-4">
                    <Container>
                        <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
                            <Search
                                onClick={filterOpen}
                                aria-expanded={isFilterOpen}
                                aria-controls="categories-menu"
                            />
                            <UserMenu currentUser={currentUser} />
                        </div>
                    </Container>
                </div>
                {isFilterOpen && (
                    <div
                        id="categories-menu"
                        role="region"
                        aria-label="Categories filter"
                    >
                        <Categories />
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;

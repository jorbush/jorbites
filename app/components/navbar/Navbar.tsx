'use client';

import { useCallback, useEffect, useState } from 'react';
import Container from '../Container';
import Categories from './Categories';
import Search from './Search';
import UserMenu from './UserMenu';
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
        <div className="fixed z-10 w-full bg-white shadow-sm dark:bg-dark">
            <div className="border-b-[1px] py-4">
                <Container>
                    <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
                        <Search onClick={filterOpen} />
                        <UserMenu
                            currentUser={currentUser}
                        />
                    </div>
                </Container>
            </div>
            {isFilterOpen && <Categories />}
        </div>
    );
};

export default Navbar;

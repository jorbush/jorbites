'use client';

import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
    const isMobile = useMediaQuery('(max-width: 768px)');
    const pathname = usePathname();
    useTheme();

    const isMainPage = pathname === '/';
    // Check if search mode is active (search mode is active, regardless of content)
    const isMobileSearchActive = isMobile && isMainPage && isSearchModeActive;

    const handleSearchModeChange = useCallback((isActive: boolean) => {
        setIsSearchModeActive(isActive);
    }, []);

    return (
        <header className="dark:bg-dark fixed z-10 w-full bg-white shadow-xs">
            <nav aria-label="Main navigation">
                <div className="border-b-[1px] py-3 sm:py-4">
                    <Container>
                        <div className="flex min-h-[48px] flex-row items-center justify-between gap-3 md:gap-0">
                            <Search
                                onSearchModeChange={handleSearchModeChange}
                            />
                            {/* Animated UserMenu - hide during search mode on both mobile and desktop */}
                            <AnimatePresence mode="wait">
                                {!isMobile ||
                                !isMainPage ||
                                (isMobile && !isMobileSearchActive) ? (
                                    <motion.div
                                        key="user-menu"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{
                                            duration: 0.3,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <UserMenu currentUser={currentUser} />
                                    </motion.div>
                                ) : (
                                    /* Invisible spacer to maintain height when UserMenu is hidden */
                                    <div className="min-h-[48px] w-0" />
                                )}
                            </AnimatePresence>
                        </div>
                    </Container>
                </div>
                {/* Show categories below navbar */}
                <AnimatePresence>
                    {isMainPage && isSearchModeActive && (
                        <motion.div
                            key="categories"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                            id="categories-menu"
                            role="region"
                            aria-label="Categories filter"
                        >
                            <Categories />
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Navbar;

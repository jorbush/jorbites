'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface OrderByDropdownProps {
    isMobile?: boolean;
}

const OrderByDropdown: React.FC<OrderByDropdownProps> = ({
    isMobile = false,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
    const orderDropdownRef = useRef<HTMLDivElement>(null);

    const isMainPage = pathname === '/';
    const currentOrderBy = searchParams?.get('orderBy') || 'newest';

    // Close order dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                orderDropdownRef.current &&
                !orderDropdownRef.current.contains(event.target as Node)
            ) {
                setIsOrderDropdownOpen(false);
            }
        };

        if (isOrderDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOrderDropdownOpen]);

    const handleOrderChange = (orderBy: string) => {
        if (!isMainPage) return;
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (orderBy === 'newest') {
            params.delete('orderBy');
        } else {
            params.set('orderBy', orderBy);
        }
        router.replace(params.toString() ? `/?${params.toString()}` : '/');
        setIsOrderDropdownOpen(false);
    };

    const getOrderLabel = (orderBy: string) => {
        switch (orderBy) {
            case 'oldest':
                return t('oldest_first') || 'Oldest first';
            case 'title_asc':
                return t('title_a_z') || 'Title A-Z';
            case 'title_desc':
                return t('title_z_a') || 'Title Z-A';
            case 'most_liked':
                return t('most_liked') || 'Most liked';
            case 'newest':
            default:
                return t('newest_first') || 'Newest first';
        }
    };

    const orderOptions = [
        'newest',
        'oldest',
        'title_asc',
        'title_desc',
        'most_liked',
    ];

    return (
        <div
            className="relative"
            ref={orderDropdownRef}
        >
            <button
                onClick={() => setIsOrderDropdownOpen(!isOrderDropdownOpen)}
                className={`flex items-center gap-1 rounded-full bg-neutral-100 text-sm text-neutral-600 shadow-xs transition hover:bg-neutral-200 hover:shadow-md dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 ${
                    isMobile ? 'px-2 py-2' : 'px-3 py-2'
                }`}
                aria-label={t('order_by') || 'Order by'}
                aria-expanded={isOrderDropdownOpen}
            >
                {isMobile ? (
                    <span className="text-xs">Sort</span>
                ) : (
                    <>
                        <span className="hidden sm:inline">
                            {getOrderLabel(currentOrderBy)}
                        </span>
                        <span className="sm:hidden">Sort</span>
                    </>
                )}
                <FiChevronDown
                    size={isMobile ? 12 : 14}
                    className={`transition-transform ${isOrderDropdownOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOrderDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full right-0 z-50 mt-2 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 ${
                            isMobile ? 'w-40' : 'w-48'
                        }`}
                    >
                        {orderOptions.map((orderBy) => (
                            <button
                                key={orderBy}
                                onClick={() => handleOrderChange(orderBy)}
                                className={`w-full text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                    isMobile
                                        ? 'px-3 py-2 text-xs'
                                        : 'px-4 py-2 text-sm'
                                } ${
                                    currentOrderBy === orderBy
                                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                        : 'text-neutral-700 dark:text-neutral-300'
                                }`}
                            >
                                {getOrderLabel(orderBy)}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderByDropdown;

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import {
    OrderByType,
    ORDER_BY_OPTIONS,
    ORDER_BY_LABELS,
    ORDER_BY_FALLBACK_LABELS,
} from '@/app/utils/order-by';

const OrderByDropdown: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
    const orderDropdownRef = useRef<HTMLDivElement>(null);

    const isMainPage = pathname === '/';
    const currentOrderBy =
        (searchParams?.get('orderBy') as OrderByType) || OrderByType.NEWEST;

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

    const handleOrderChange = (orderBy: OrderByType) => {
        if (!isMainPage) return;
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (orderBy === OrderByType.NEWEST) {
            params.delete('orderBy');
        } else {
            params.set('orderBy', orderBy);
        }
        router.replace(params.toString() ? `/?${params.toString()}` : '/');
        setIsOrderDropdownOpen(false);
    };

    const getOrderLabel = (orderBy: OrderByType) => {
        const translationKey = ORDER_BY_LABELS[orderBy];
        const fallbackLabel = ORDER_BY_FALLBACK_LABELS[orderBy];
        return t(translationKey) || fallbackLabel;
    };

    return (
        <div
            className="relative"
            ref={orderDropdownRef}
        >
            <button
                onClick={() => setIsOrderDropdownOpen(!isOrderDropdownOpen)}
                className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-2 text-sm text-neutral-600 shadow-xs transition hover:bg-neutral-200 hover:shadow-md sm:px-3 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                aria-label={t('order_by') || 'Order by'}
                aria-expanded={isOrderDropdownOpen}
            >
                <span className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">
                        {getOrderLabel(currentOrderBy)}
                    </span>
                    <span className="sm:hidden">Sort</span>
                </span>
                <FiChevronDown
                    size={14}
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
                        className="dark:bg-dark absolute top-full right-0 z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:text-neutral-100"
                    >
                        <div className="w-max cursor-pointer">
                            {ORDER_BY_OPTIONS.map((orderBy) => (
                                <div
                                    key={orderBy}
                                    onClick={() => handleOrderChange(orderBy)}
                                    className={`flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                        currentOrderBy === orderBy
                                            ? 'bg-green-450/10 text-green-450 dark:bg-green-450/20 dark:text-green-450'
                                            : 'text-neutral-700 dark:text-neutral-300'
                                    }`}
                                >
                                    <span className="whitespace-nowrap">
                                        {getOrderLabel(orderBy)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderByDropdown;

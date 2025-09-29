'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export interface DateRange {
    startDate: string;
    endDate: string;
}

const PeriodFilter: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState('');
    const [tempEndDate, setTempEndDate] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isMainPage = pathname === '/';
    const currentStartDate = searchParams?.get('startDate') || '';
    const currentEndDate = searchParams?.get('endDate') || '';
    const hasDateFilter = currentStartDate || currentEndDate;

    useEffect(() => {
        // Initialize temp dates from URL params
        setTempStartDate(currentStartDate);
        setTempEndDate(currentEndDate);
    }, [currentStartDate, currentEndDate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const updateUrlWithDates = (startDate: string, endDate: string) => {
        if (!isMainPage) return;

        const params = new URLSearchParams(searchParams?.toString() || '');

        if (startDate) {
            params.set('startDate', startDate);
        } else {
            params.delete('startDate');
        }

        if (endDate) {
            params.set('endDate', endDate);
        } else {
            params.delete('endDate');
        }

        router.replace(params.toString() ? `/?${params.toString()}` : '/');
    };

    const handleApply = () => {
        updateUrlWithDates(tempStartDate, tempEndDate);
        setIsOpen(false);
    };

    const handleClear = () => {
        setTempStartDate('');
        setTempEndDate('');
        updateUrlWithDates('', '');
        setIsOpen(false);
    };

    const formatDateRange = () => {
        if (!currentStartDate && !currentEndDate) return null;

        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year:
                    date.getFullYear() !== new Date().getFullYear()
                        ? 'numeric'
                        : undefined,
            });
        };

        if (currentStartDate && currentEndDate) {
            return `${formatDate(currentStartDate)} - ${formatDate(currentEndDate)}`;
        } else if (currentStartDate) {
            return `From ${formatDate(currentStartDate)}`;
        } else {
            return `Until ${formatDate(currentEndDate)}`;
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div
            className="relative"
            ref={dropdownRef}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative rounded-full p-2 shadow-xs transition hover:shadow-md ${
                    hasDateFilter
                        ? 'bg-green-450 dark:text-dark text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
                aria-label={t('filter_by_date') || 'Filter by date'}
                aria-expanded={isOpen}
                data-testid="period-filter-button"
            >
                <FiCalendar size={18} />
                {hasDateFilter && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-12 right-0 z-50 min-w-[280px] rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                                    {t('filter_by_date') || 'Filter by date'}
                                </h3>
                                {hasDateFilter && (
                                    <button
                                        onClick={handleClear}
                                        className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                                        aria-label={
                                            t('clear_date_filter') ||
                                            'Clear date filter'
                                        }
                                    >
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>

                            {hasDateFilter && (
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {formatDateRange()}
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {t('from_date') || 'From date'}
                                    </label>
                                    <input
                                        type="date"
                                        value={tempStartDate}
                                        max={tempEndDate || today}
                                        onChange={(e) =>
                                            setTempStartDate(e.target.value)
                                        }
                                        className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {t('to_date') || 'To date'}
                                    </label>
                                    <input
                                        type="date"
                                        value={tempEndDate}
                                        min={tempStartDate}
                                        max={today}
                                        onChange={(e) =>
                                            setTempEndDate(e.target.value)
                                        }
                                        className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleApply}
                                    disabled={!tempStartDate && !tempEndDate}
                                    className="bg-green-450 flex-1 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-600 dark:disabled:text-neutral-400"
                                >
                                    {t('apply') || 'Apply'}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                >
                                    {t('cancel') || 'Cancel'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PeriodFilter;

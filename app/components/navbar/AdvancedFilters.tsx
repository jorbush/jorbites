'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiSliders, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Button from '../buttons/Button';

const POPULAR_CUISINES = [
    'Italian',
    'Spanish',
    'Mexican',
    'Japanese',
    'Chinese',
    'Indian',
    'French',
    'American',
    'Mediterranean',
];

const AdvancedFiltersComponent: React.FC = () => {
    const { t } = useTranslation();
    const { replace } = useRouter() || {};
    const searchParams = useSearchParams();
    const get = searchParams ? searchParams.get.bind(searchParams) : () => null;
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;

    const currentMinCalories = get('minCalories') || '';
    const currentMaxCalories = get('maxCalories') || '';
    const currentMinYield = get('minYield') || '';
    const currentMaxYield = get('maxYield') || '';
    const currentCuisine = get('recipeCuisine') || '';

    const hasActiveFilters = !!(
        currentMinCalories ||
        currentMaxCalories ||
        currentMinYield ||
        currentMaxYield ||
        currentCuisine
    );

    const [isOpen, setIsOpen] = useState(false);
    const [tempMinCalories, setTempMinCalories] = useState(currentMinCalories);
    const [tempMaxCalories, setTempMaxCalories] = useState(currentMaxCalories);
    const [tempMinYield, setTempMinYield] = useState(currentMinYield);
    const [tempMaxYield, setTempMaxYield] = useState(currentMaxYield);
    const [tempCuisine, setTempCuisine] = useState(currentCuisine);

    // Sync state with URL params on open or url changes
    useEffect(() => {
        setTempMinCalories(currentMinCalories);
        setTempMaxCalories(currentMaxCalories);
        setTempMinYield(currentMinYield);
        setTempMaxYield(currentMaxYield);
        setTempCuisine(currentCuisine);
    }, [
        isOpen,
        currentMinCalories,
        currentMaxCalories,
        currentMinYield,
        currentMaxYield,
        currentCuisine,
    ]);

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

    const updateUrlWithFilters = (
        minCal: string,
        maxCal: string,
        minYld: string,
        maxYld: string,
        cuisine: string
    ) => {
        if (!isFilterablePage) return;

        const params = new URLSearchParams(searchParams?.toString() || '');

        if (minCal) params.set('minCalories', minCal);
        else params.delete('minCalories');

        if (maxCal) params.set('maxCalories', maxCal);
        else params.delete('maxCalories');

        if (minYld) params.set('minYield', minYld);
        else params.delete('minYield');

        if (maxYld) params.set('maxYield', maxYld);
        else params.delete('maxYield');

        if (cuisine) params.set('recipeCuisine', cuisine);
        else params.delete('recipeCuisine');

        params.delete('page'); // Reset pagination to page 1

        const newUrl = isMainPage
            ? params.toString()
                ? `/?${params.toString()}`
                : '/'
            : params.toString()
              ? `${pathname}?${params.toString()}`
              : pathname;

        replace(newUrl);
    };

    const handleApply = () => {
        updateUrlWithFilters(
            tempMinCalories,
            tempMaxCalories,
            tempMinYield,
            tempMaxYield,
            tempCuisine
        );
        setIsOpen(false);
    };

    const handleClear = () => {
        setTempMinCalories('');
        setTempMaxCalories('');
        setTempMinYield('');
        setTempMaxYield('');
        setTempCuisine('');
        if (isFilterablePage) {
            updateUrlWithFilters('', '', '', '', '');
        }
    };

    const handleCuisinePillClick = (cuisine: string) => {
        if (tempCuisine.toLowerCase() === cuisine.toLowerCase()) {
            setTempCuisine('');
        } else {
            setTempCuisine(cuisine);
        }
    };

    const isAnyTempFilterSet = !!(
        tempMinCalories ||
        tempMaxCalories ||
        tempMinYield ||
        tempMaxYield ||
        tempCuisine
    );

    return (
        <div
            className="relative"
            ref={dropdownRef}
            data-testid="advanced-filters-container"
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative cursor-pointer rounded-full p-2 shadow-xs transition hover:shadow-md ${
                    hasActiveFilters
                        ? 'bg-green-450 dark:text-dark text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
                aria-label={t('filter_options') || 'Filter options'}
                aria-expanded={isOpen}
                data-testid="advanced-filters-button"
            >
                <FiSliders size={18} />
                {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                )}
            </button>

            {isOpen && (
                <div
                    className="dark:bg-dark/97 absolute top-12 right-0 z-50 max-w-[340px] min-w-[320px] rounded-xl border border-neutral-200/40 bg-white/97 p-4 shadow-[0_2px_20px_rgba(0,0,0,0.03)] backdrop-blur-lg transition-all duration-300 dark:border-neutral-800/40 dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)]"
                    style={{
                        animation: 'dropdownFadeIn 0.15s ease-out forwards',
                    }}
                    data-testid="advanced-filters-dropdown"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                                {t('filter_options') || 'Filter options'}
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                                    aria-label={
                                        t('clear_all_filters') ||
                                        'Clear all filters'
                                    }
                                    data-testid="clear-filters-button"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>

                        {/* Calories filter */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {t('calories') || 'Calories'} (kcal)
                            </span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder={t('min_calories') || 'Min'}
                                    aria-label={
                                        t('min_calories') || 'Min calories'
                                    }
                                    value={tempMinCalories}
                                    onChange={(e) =>
                                        setTempMinCalories(e.target.value)
                                    }
                                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                                    data-testid="min-calories-input"
                                />
                                <span className="text-neutral-400">-</span>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder={t('max_calories') || 'Max'}
                                    aria-label={
                                        t('max_calories') || 'Max calories'
                                    }
                                    value={tempMaxCalories}
                                    onChange={(e) =>
                                        setTempMaxCalories(e.target.value)
                                    }
                                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                                    data-testid="max-calories-input"
                                />
                            </div>
                        </div>

                        {/* Servings/Yield filter */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {t('yield') || 'Servings'}
                            </span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder={t('min_yield') || 'Min'}
                                    aria-label={
                                        t('min_yield') || 'Min servings'
                                    }
                                    value={tempMinYield}
                                    onChange={(e) =>
                                        setTempMinYield(e.target.value)
                                    }
                                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                                    data-testid="min-yield-input"
                                />
                                <span className="text-neutral-400">-</span>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder={t('max_yield') || 'Max'}
                                    aria-label={
                                        t('max_yield') || 'Max servings'
                                    }
                                    value={tempMaxYield}
                                    onChange={(e) =>
                                        setTempMaxYield(e.target.value)
                                    }
                                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                                    data-testid="max-yield-input"
                                />
                            </div>
                        </div>

                        {/* Cuisine filter */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="cuisine-input"
                                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                            >
                                {t('recipe_cuisine') || 'Cuisine'}
                            </label>
                            <input
                                id="cuisine-input"
                                type="text"
                                placeholder={
                                    t('cuisine_placeholder') ||
                                    'e.g. Italian, Spanish'
                                }
                                value={tempCuisine}
                                onChange={(e) => setTempCuisine(e.target.value)}
                                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                                data-testid="cuisine-input"
                            />

                            {/* Popular cuisines quick-select pills */}
                            <div className="flex flex-col gap-1 pt-1">
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    {t('popular_cuisines') ||
                                        'Popular cuisines'}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {POPULAR_CUISINES.map((cuisine) => {
                                        const translationKey = `cuisine_${cuisine.toLowerCase().replace(/\s+/g, '_')}`;
                                        const label = t(translationKey, {
                                            defaultValue: cuisine,
                                        });
                                        const isSelected =
                                            tempCuisine.toLowerCase() ===
                                            cuisine.toLowerCase();

                                        return (
                                            <button
                                                key={cuisine}
                                                type="button"
                                                onClick={() =>
                                                    handleCuisinePillClick(
                                                        cuisine
                                                    )
                                                }
                                                className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition ${
                                                    isSelected
                                                        ? 'bg-green-450 text-white'
                                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                                                }`}
                                                data-testid={`cuisine-pill-${cuisine.toLowerCase()}`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Dropdown Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <div className="flex-1">
                                <Button
                                    label={t('cancel') || 'Cancel'}
                                    onClick={() => setIsOpen(false)}
                                    outline
                                    small
                                    dataCy="cancel-filters-button"
                                />
                            </div>
                            <div className="flex-1">
                                <Button
                                    label={t('apply') || 'Apply'}
                                    onClick={handleApply}
                                    disabled={!isAnyTempFilterSet}
                                    small
                                    dataCy="apply-filters-button"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdvancedFilters: React.FC = () => (
    <Suspense fallback={null}>
        <AdvancedFiltersComponent />
    </Suspense>
);

export default AdvancedFilters;

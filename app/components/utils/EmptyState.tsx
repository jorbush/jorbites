'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Button from '@/app/components/buttons/Button';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
    showReset?: boolean;
    height?: string;
}

const FILTER_QUERY_PARAMS = [
    'search',
    'category',
    'startDate',
    'endDate',
    'minCalories',
    'maxCalories',
    'minYield',
    'maxYield',
    'recipeCuisine',
] as const;

const DEFAULT_TITLE = 'No exact matches';
const DEFAULT_SUBTITLE = 'Try changing or removing some of your filters.';
const DEFAULT_HEIGHT = 'h-[60vh]';

interface EmptyStateTextConfig {
    displayTitle: string;
    displaySubtitle: string;
    buttonLabel: string;
}

const isNotFoundTitle = (title: string): boolean =>
    title === 'Recipe not found' || title === 'recipe_not_found';

const getNotFoundContent = (
    t: (key: string) => string
): EmptyStateTextConfig => ({
    displayTitle: t('recipe_not_found') || 'Recipe not found',
    displaySubtitle:
        t('recipe_not_found_message') ||
        "Sorry, we couldn't find this recipe. It may have been removed or the link might be incorrect.",
    buttonLabel: t('remove_all_filters'),
});

const getSearchContent = (
    hasCategory: boolean,
    t: (key: string) => string
): EmptyStateTextConfig => {
    if (!hasCategory) {
        return {
            displayTitle: t('no_recipes_found') || 'No recipes found',
            displaySubtitle:
                t('no_search_results_subtitle') ||
                'Try searching with different keywords or check your spelling.',
            buttonLabel: t('clear_search') || 'Clear search',
        };
    }

    return {
        displayTitle: t('no_recipes_found') || 'No recipes found',
        displaySubtitle:
            t('no_search_category_results') ||
            'Try removing the category filter or changing your search terms.',
        buttonLabel: t('remove_all_filters') || 'Remove all filters',
    };
};

const resolveEmptyStateText = (
    title: string,
    subtitle: string,
    searchQuery: string | null,
    category: string | null,
    t: (key: string) => string
): EmptyStateTextConfig => {
    if (isNotFoundTitle(title)) {
        return getNotFoundContent(t);
    }

    if (searchQuery) {
        return getSearchContent(Boolean(category), t);
    }

    return {
        displayTitle: title,
        displaySubtitle: subtitle,
        buttonLabel: t('remove_all_filters'),
    };
};

export const useEmptyState = (title: string, subtitle: string) => {
    const { push } = useRouter() || {};
    const searchParams = useSearchParams();
    const { t } = useTranslation();

    const searchQuery = searchParams?.get('search') ?? null;
    const category = searchParams?.get('category') ?? null;

    // Note: orderBy is not a filter, it's a sorting option, so we don't include it
    const hasFilters = FILTER_QUERY_PARAMS.some((param) =>
        Boolean(searchParams?.get(param))
    );

    const { displayTitle, displaySubtitle, buttonLabel } =
        resolveEmptyStateText(title, subtitle, searchQuery, category, t);

    const handleReset = () => {
        // Use window.location.pathname to avoid re-rendering on every URL change
        // Navigate to the base path without any query parameters
        push?.(window.location.pathname || '/');
    };

    return {
        displayTitle,
        displaySubtitle,
        buttonLabel,
        hasFilters,
        handleReset,
    };
};

const EmptyStateContent: React.FC<EmptyStateProps> = ({
    title = DEFAULT_TITLE,
    subtitle = DEFAULT_SUBTITLE,
    showReset,
    height = DEFAULT_HEIGHT,
}) => {
    const {
        displayTitle,
        displaySubtitle,
        buttonLabel,
        hasFilters,
        handleReset,
    } = useEmptyState(title, subtitle);

    const canReset = Boolean(showReset && hasFilters);

    return (
        <div
            className={`flex ${height} flex-col items-center justify-center gap-2`}
        >
            <Heading
                center
                title={displayTitle}
                subtitle={displaySubtitle}
            />
            <div className="mt-4 w-48">
                {canReset && (
                    <Button
                        outline
                        label={buttonLabel}
                        onClick={handleReset}
                    />
                )}
            </div>
        </div>
    );
};

const EmptyState: React.FC<EmptyStateProps> = (props) => {
    return (
        <Suspense
            fallback={
                <div
                    className={`flex ${props.height || 'h-[60vh]'} flex-col items-center justify-center gap-2`}
                >
                    Loading…
                </div>
            }
        >
            <EmptyStateContent {...props} />
        </Suspense>
    );
};

export default EmptyState;

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import Button from '@/app/components/buttons/Button';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
    showReset?: boolean;
    height?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No exact matches',
    subtitle = 'Try changing or removing some of your filters.',
    showReset,
    height = 'h-[60vh]',
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { t } = useTranslation();

    const searchQuery = searchParams?.get('search');
    const category = searchParams?.get('category');
    const startDate = searchParams?.get('startDate');
    const endDate = searchParams?.get('endDate');

    // Note: orderBy is not a filter, it's a sorting option, so we don't include it
    const hasFilters = !!(searchQuery || category || startDate || endDate);

    // Customize messages based on current filters
    let displayTitle = title;
    let displaySubtitle = subtitle;
    let buttonLabel = t('remove_all_filters');

    if (searchQuery && !category) {
        displayTitle = t('no_recipes_found') || 'No recipes found';
        displaySubtitle =
            t('no_search_results_subtitle') ||
            'Try searching with different keywords or check your spelling.';
        buttonLabel = t('clear_search') || 'Clear search';
    } else if (searchQuery && category) {
        displayTitle = t('no_recipes_found') || 'No recipes found';
        displaySubtitle =
            t('no_search_category_results') ||
            'Try removing the category filter or changing your search terms.';
        buttonLabel = t('remove_all_filters') || 'Remove all filters';
    }

    const handleReset = () => {
        // Use pathname from usePathname hook instead of window.location
        // Navigate to the base path without any query parameters
        router.push(pathname || '/');
    };

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
                {showReset && hasFilters && (
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

export default EmptyState;

'use client';

import { SafeUser } from '@/app/types';
import ChefCard from './ChefCard';
import EmptyState from '@/app/components/utils/EmptyState';
import { useTranslation } from 'react-i18next';

interface ChefsListProps {
    chefs: SafeUser[];
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
}

const ChefsList: React.FC<ChefsListProps> = ({
    chefs,
    emptyStateTitle,
    emptyStateSubtitle,
}) => {
    const { t } = useTranslation();

    if (chefs.length === 0) {
        return (
            <EmptyState
                title={emptyStateTitle || t('no_chefs') || 'No chefs found'}
                subtitle={
                    emptyStateSubtitle ||
                    t('no_chefs_description') ||
                    'Try adjusting your search or filters'
                }
                height="h-[30vh]"
            />
        );
    }

    return (
        <section
            aria-label="Chefs grid"
            className="min-h-[60vh]"
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {chefs.map((chef) => (
                    <ChefCard
                        key={chef.id}
                        chef={chef}
                    />
                ))}
            </div>
        </section>
    );
};

export default ChefsList;

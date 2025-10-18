'use client';

import { SafeWorkshop, SafeUser } from '@/app/types';
import WorkshopCard from './WorkshopCard';
import EmptyState from '@/app/components/utils/EmptyState';

interface WorkshopListProps {
    workshops: SafeWorkshop[];
    currentUser?: SafeUser | null;
    emptyStateTitle: string;
    emptyStateSubtitle: string;
}

const WorkshopList: React.FC<WorkshopListProps> = ({
    workshops,
    currentUser,
    emptyStateTitle,
    emptyStateSubtitle,
}) => {
    if (workshops.length === 0) {
        return (
            <div className="min-h-[60vh]">
                <EmptyState
                    title={emptyStateTitle}
                    subtitle={emptyStateSubtitle}
                />
            </div>
        );
    }

    return (
        <section
            aria-label="Workshops grid"
            className="min-h-[60vh]"
        >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {workshops.map((workshop, index) => (
                    <WorkshopCard
                        key={workshop.id}
                        data={workshop}
                        currentUser={currentUser}
                        isFirstCard={index === 0}
                    />
                ))}
            </div>
        </section>
    );
};

export default WorkshopList;

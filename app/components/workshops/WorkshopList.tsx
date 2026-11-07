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
            <EmptyState
                title={emptyStateTitle}
                subtitle={emptyStateSubtitle}
                height="h-[30vh]"
            />
        );
    }

    return (
        <section
            aria-label="Workshops grid"
            className="min-h-[50vh]"
        >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

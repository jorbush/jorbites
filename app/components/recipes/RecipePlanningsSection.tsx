'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PiCalendarCheckDuotone } from 'react-icons/pi';
import { SafePlanning, SafeUser } from '@/app/types';
import { PlanningCard } from '@/app/components/plannings/PlanningCard';
import useIsMounted from '@/app/hooks/useIsMounted';

interface RecipePlanningsSectionProps {
    plannings: SafePlanning[];
    currentUser?: SafeUser | null;
}

export const RecipePlanningsSection: React.FC<RecipePlanningsSectionProps> = ({
    plannings,
    currentUser,
}) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const mounted = useIsMounted();

    if (!plannings || plannings.length === 0) {
        return null;
    }

    const sectionTitle = mounted
        ? t('included_in_plannings', {
              defaultValue: 'Included in Meal Plans',
          })
        : 'Included in Meal Plans';

    const push = (url: string) => {
        router?.push(url);
    };

    return (
        <section
            className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90"
            data-cy="recipe-plannings-section"
            data-testid="recipe-plannings-section"
            aria-label={sectionTitle}
        >
            <div className="mb-4 flex flex-row items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-700 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300">
                    <PiCalendarCheckDuotone
                        size={18}
                        aria-hidden="true"
                    />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {sectionTitle}
                </h2>
            </div>

            <div
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                data-cy="recipe-plannings-grid"
            >
                {plannings.map((plan) => (
                    <PlanningCard
                        key={plan.id}
                        plan={plan}
                        currentUser={currentUser}
                        showDelete={false}
                        push={push}
                        t={t}
                        language={i18n.language}
                    />
                ))}
            </div>
        </section>
    );
};

export default RecipePlanningsSection;

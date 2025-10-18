'use client';

import { useTranslation } from 'react-i18next';
import { SafeWorkshop, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import WorkshopsHeader from '@/app/components/workshops/WorkshopsHeader';
import { FcConferenceCall } from 'react-icons/fc';
import WorkshopList from '@/app/components/workshops/WorkshopList';
import Button from '@/app/components/buttons/Button';
import useWorkshopModal from '@/app/hooks/useWorkshopModal';
import useLoginModal from '@/app/hooks/useLoginModal';

interface WorkshopsClientProps {
    currentUser?: SafeUser | null;
    upcomingWorkshops: SafeWorkshop[];
    pastWorkshops: SafeWorkshop[];
}

const WorkshopsClient: React.FC<WorkshopsClientProps> = ({
    currentUser,
    upcomingWorkshops,
    pastWorkshops,
}) => {
    const { t } = useTranslation();
    const workshopModal = useWorkshopModal();
    const loginModal = useLoginModal();

    const onCreateWorkshop = () => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        workshopModal.onOpen();
    };

    return (
        <Container>
            <div>
                <WorkshopsHeader
                    icon={FcConferenceCall}
                    title={t('workshops')}
                    description={t('workshops_description')}
                />
                <div className="mb-6">
                    <h1 className="text-3xl font-bold dark:text-neutral-100">
                        {t('upcoming_workshops')}
                    </h1>
                </div>
                <WorkshopList
                    workshops={upcomingWorkshops}
                    currentUser={currentUser}
                    emptyStateTitle={t('no_upcoming_workshops_found')}
                    emptyStateSubtitle={t('check_back_later')}
                />
                <div className="mt-12 mb-6">
                    <h1 className="text-3xl font-bold dark:text-neutral-100">
                        {t('past_workshops')}
                    </h1>
                </div>
                <WorkshopList
                    workshops={pastWorkshops}
                    currentUser={currentUser}
                    emptyStateTitle={t('no_past_workshops_found')}
                    emptyStateSubtitle={t('check_back_later_past')}
                />

                {/* Call to Action Card */}
                <div className="border-green-450/20 from-green-450/10 to-green-450/20 dark:border-green-450/30 dark:from-green-450/10 dark:to-green-450/20 mt-16 rounded-lg border-2 border-dashed bg-gradient-to-r p-8 text-center">
                    <div className="mx-auto max-w-md">
                        <div className="mb-4 text-4xl">👨‍🍳</div>
                        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100">
                            {t('contribute_to_community') ||
                                'Do you want to contribute to the community sharing your knowledge?'}
                        </h3>
                        <p className="mb-6 text-gray-600 dark:text-neutral-400">
                            {t('share_cooking_skills') ||
                                'Share your cooking skills and help others learn new recipes and techniques.'}
                        </p>
                        <Button
                            label={t('create_workshop')}
                            onClick={onCreateWorkshop}
                            dataCy="create-workshop"
                        />
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default WorkshopsClient;

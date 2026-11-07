'use client';

import { useTranslation } from 'react-i18next';
import { SafeWorkshop, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import WorkshopHead from '@/app/components/workshops/WorkshopHead';
import WorkshopInfo from '@/app/components/workshops/WorkshopInfo';
import JoinWorkshopButton from '@/app/components/workshops/JoinWorkshopButton';
import EditWorkshopButton from '@/app/components/workshops/EditWorkshopButton';
import DeleteWorkshopModal from '@/app/components/modals/DeleteWorkshopModal';
import Button from '@/app/components/buttons/Button';
import { MdDelete } from 'react-icons/md';
import { useState } from 'react';

interface WorkshopClientProps {
    workshop: SafeWorkshop & {
        host: SafeUser;
        participants?: any[];
    };
    currentUser?: SafeUser | null;
}

const WorkshopClient: React.FC<WorkshopClientProps> = ({
    workshop,
    currentUser,
}) => {
    const { t } = useTranslation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const isHost = currentUser?.id === workshop.hostId;
    const isParticipant =
        workshop.participants?.some((p) => p.userId === currentUser?.id) ||
        false;
    const isPast = new Date(workshop.date) < new Date();
    const canAccessPrivate =
        !workshop.isPrivate ||
        isHost ||
        workshop.whitelistedUserIds.includes(currentUser?.id || '');

    if (workshop.isPrivate && !canAccessPrivate) {
        return (
            <Container>
                <div className="mx-auto flex max-w-screen-lg flex-col gap-6 pt-16">
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-8 text-center shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800">
                            <span className="text-xl">🔒</span>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            {t('private_workshop_title')}
                        </h2>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {t('private_workshop_message')}
                        </p>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <DeleteWorkshopModal
                open={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                id={workshop.id}
            />
            <div className="mx-auto flex max-w-screen-lg flex-col gap-6 pt-2 pb-12 sm:pt-4">
                <WorkshopHead
                    title={workshop.title}
                    date={workshop.date}
                    imageSrc={workshop.imageSrc || ''}
                />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-7 md:gap-10">
                    <WorkshopInfo
                        host={workshop.host}
                        description={workshop.description}
                        date={workshop.date}
                        location={workshop.location}
                        isRecurrent={workshop.isRecurrent}
                        recurrencePattern={workshop.recurrencePattern}
                        isPrivate={workshop.isPrivate}
                        price={workshop.price}
                        ingredients={workshop.ingredients}
                        previousSteps={workshop.previousSteps}
                        currentUser={currentUser}
                        id={workshop.id}
                        participants={workshop.participants}
                        whitelistedUserIds={workshop.whitelistedUserIds}
                    />
                    <div className="order-first mb-10 md:order-last md:col-span-3">
                        <div className="sticky top-24 flex flex-col gap-4">
                            {isHost ? (
                                <>
                                    <EditWorkshopButton workshop={workshop} />
                                    <Button
                                        label={t('delete_workshop')}
                                        onClick={() =>
                                            setIsDeleteModalOpen(true)
                                        }
                                        icon={MdDelete}
                                        deleteButton
                                        dataCy="delete-workshop"
                                    />
                                </>
                            ) : (
                                <JoinWorkshopButton
                                    workshopId={workshop.id}
                                    currentUser={currentUser}
                                    isParticipant={isParticipant}
                                    isPast={isPast}
                                    isHost={isHost}
                                />
                            )}
                            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                    <p className="mb-3 font-bold text-neutral-900 dark:text-white">
                                        {t('workshop_information_title')}
                                    </p>
                                    <div className="space-y-2">
                                        <p>
                                            {t('participants_label')}{' '}
                                            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                                                {workshop.participants
                                                    ?.length || 0}
                                            </span>
                                        </p>
                                        {workshop.price > 0 ? (
                                            <p>
                                                {t('price_label')}{' '}
                                                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                                                    {workshop.price.toFixed(2)}{' '}
                                                    {workshop.currency == 'EUR'
                                                        ? '€'
                                                        : '$'}
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="text-green-450 font-semibold">
                                                {t('free')}
                                            </p>
                                        )}
                                        {workshop.isPrivate && (
                                            <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-yellow-200/80 bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700 dark:border-yellow-800/60 dark:bg-yellow-950/40 dark:text-yellow-400">
                                                {t('private_workshop_badge')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default WorkshopClient;

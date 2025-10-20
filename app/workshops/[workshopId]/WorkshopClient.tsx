'use client';

import { SafeWorkshop, SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import WorkshopHead from '@/app/components/workshops/WorkshopHead';
import WorkshopInfo from '@/app/components/workshops/WorkshopInfo';
import JoinWorkshopButton from '@/app/components/workshops/JoinWorkshopButton';
import EditWorkshopButton from '@/app/components/workshops/EditWorkshopButton';
import DeleteWorkshopButton from '@/app/components/workshops/DeleteWorkshopButton';

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
                <div className="mx-auto flex max-w-screen-lg flex-col gap-6 pt-24">
                    <div className="rounded-lg bg-yellow-100 p-6 text-center dark:bg-yellow-900/30">
                        <h2 className="mb-2 text-2xl font-bold dark:text-neutral-100">
                            Private Workshop
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            This is a private workshop and you are not invited.
                        </p>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="mx-auto flex max-w-screen-lg flex-col gap-6 pt-2">
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
                                    <DeleteWorkshopButton
                                        workshopId={workshop.id}
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
                            <div className="rounded-lg border p-4 dark:border-neutral-700">
                                <div className="text-sm text-neutral-500">
                                    <p className="mb-2 font-semibold dark:text-neutral-100">
                                        Workshop Information
                                    </p>
                                    <p>
                                        Participants:{' '}
                                        {workshop.participants?.length || 0}
                                    </p>
                                    {workshop.price > 0 && (
                                        <p>
                                            Price: €{workshop.price.toFixed(2)}
                                        </p>
                                    )}
                                    {workshop.isPrivate && (
                                        <p className="mt-2 text-yellow-600 dark:text-yellow-400">
                                            🔒 Private Workshop
                                        </p>
                                    )}
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

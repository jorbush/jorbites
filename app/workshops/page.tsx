import Container from '@/app/components/utils/Container';
import WorkshopCard from '@/app/components/workshops/WorkshopCard';
import EmptyState from '@/app/components/utils/EmptyState';
import getWorkshops, { IWorkshopsParams } from '@/app/actions/getWorkshops';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/utils/ClientOnly';
import ErrorDisplay from '@/app/components/utils/ErrorDisplay';
import { Metadata } from 'next';
import CreateWorkshopButton from '@/app/components/workshops/CreateWorkshopButton';

export const metadata: Metadata = {
    title: 'Workshops | Jorbites',
    description: 'Discover and join cooking workshops in your area',
};

interface WorkshopsPageProps {
    searchParams: Promise<IWorkshopsParams>;
}

const WorkshopsPage = async ({ searchParams }: WorkshopsPageProps) => {
    const resolvedParams = await searchParams;
    const response = await getWorkshops({
        ...resolvedParams,
        upcoming: true,
        limit: 20,
    });
    const currentUser = await getCurrentUser();

    return (
        <ClientOnly>
            <Container>
                <div className="pt-24 pb-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold dark:text-neutral-100">
                            Upcoming Workshops
                        </h1>
                        <CreateWorkshopButton currentUser={currentUser} />
                    </div>
                    {response.error ? (
                        <div className="min-h-[60vh]">
                            <ErrorDisplay
                                code={response.error.code}
                                message={response.error.message}
                            />
                        </div>
                    ) : response.data?.workshops.length === 0 ? (
                        <div className="min-h-[60vh]">
                            <EmptyState
                                title="No workshops found"
                                subtitle="Check back later for upcoming workshops"
                            />
                        </div>
                    ) : (
                        <section
                            aria-label="Workshops grid"
                            className="min-h-[60vh]"
                        >
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {response.data?.workshops.map(
                                    (workshop, index) => (
                                        <WorkshopCard
                                            key={workshop.id}
                                            data={workshop}
                                            currentUser={currentUser}
                                            isFirstCard={index === 0}
                                        />
                                    )
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </Container>
        </ClientOnly>
    );
};

export default WorkshopsPage;

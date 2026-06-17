import { Suspense } from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getQuests from '@/app/actions/getQuests';
import QuestsClient from '@/app/quests/QuestsClient';
import QuestsClientSkeleton from '@/app/components/quests/QuestsClientSkeleton';
import ClientOnly from '@/app/components/utils/ClientOnly';
import Container from '@/app/components/utils/Container';
import ErrorDisplay from '@/app/components/utils/ErrorDisplay';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Retos | Jorbites',
    description:
        'Participa en retos culinarios y demuestra tus habilidades en la cocina.',
};

interface QuestsPageProps {
    searchParams: Promise<{
        status?: string;
        page?: string;
    }>;
}

const QuestsPage = async ({ searchParams }: QuestsPageProps) => {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || '1');
    const status = resolvedParams.status || 'all';

    const [currentUser, response] = await Promise.all([
        getCurrentUser(),
        getQuests({
            status: resolvedParams.status,
            page: page,
            limit: 10,
        }),
    ]);

    return (
        <Suspense fallback={<QuestsClientSkeleton />}>
            <ClientOnly fallback={<QuestsClientSkeleton />}>
                <Container>
                    {response.error ? (
                        <div className="min-h-[60vh]">
                            <ErrorDisplay
                                code={response.error.code}
                                message={response.error.message}
                            />
                        </div>
                    ) : (
                        <Suspense fallback={<QuestsClientSkeleton />}>
                            <QuestsClient
                                currentUser={currentUser}
                                quests={response.data?.quests || []}
                                totalPages={response.data?.totalPages || 1}
                                currentPage={page}
                                initialStatus={status}
                            />
                        </Suspense>
                    )}
                </Container>
            </ClientOnly>
        </Suspense>
    );
};

export default QuestsPage;

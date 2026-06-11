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
    const [currentUser, response] = await Promise.all([
        getCurrentUser(),
        searchParams.then((resolved) =>
            getQuests({
                status: resolved.status,
                page: parseInt(resolved.page || '1'),
                limit: 10,
            })
        ),
    ]);

    return (
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
                    <QuestsClient
                        currentUser={currentUser}
                        quests={response.data?.quests || []}
                        totalPages={response.data?.totalPages || 1}
                        currentPage={response.data?.currentPage || 1}
                    />
                )}
            </Container>
        </ClientOnly>
    );
};

export default QuestsPage;

import getCurrentUser from '@/app/actions/getCurrentUser';
import getQuests from '@/app/actions/getQuests';
import QuestsClient from '@/app/quests/QuestsClient';
import Container from '@/app/components/utils/Container';
import ErrorDisplay from '@/app/components/utils/ErrorDisplay';

interface QuestsPageProps {
    searchParams: Promise<{
        status?: string;
        page?: string;
    }>;
}

const QuestsPage = async ({ searchParams }: QuestsPageProps) => {
    const resolvedParams = await searchParams;
    const currentUser = await getCurrentUser();
    const page = parseInt(resolvedParams.page || '1');
    const status = resolvedParams.status;

    const response = await getQuests({
        status,
        page,
        limit: 10,
    });

    return (
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
    );
};

export default QuestsPage;

import getCurrentUser from '@/app/actions/getCurrentUser';
import getQuestById from '@/app/actions/getQuestById';
import QuestDetailClient from '@/app/quests/[questId]/QuestDetailClient';
import QuestDetailSkeleton from '@/app/components/quests/QuestDetailSkeleton';
import Container from '@/app/components/utils/Container';
import EmptyState from '@/app/components/utils/EmptyState';
import { Suspense } from 'react';

interface QuestDetailPageProps {
    params: Promise<{
        questId: string;
    }>;
}

const QuestDetailPage = async ({ params }: QuestDetailPageProps) => {
    const { questId } = await params;
    const currentUser = await getCurrentUser();
    const quest = await getQuestById({ questId });

    if (!quest) {
        return (
            <Container>
                <div className="min-h-[60vh]">
                    <EmptyState
                        title="Quest not found"
                        subtitle="The quest you're looking for doesn't exist"
                    />
                </div>
            </Container>
        );
    }

    return (
        <Suspense fallback={<QuestDetailSkeleton />}>
            <QuestDetailClient
                currentUser={currentUser}
                quest={quest}
            />
        </Suspense>
    );
};

export default QuestDetailPage;

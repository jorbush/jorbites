import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getPlanningById from '@/app/actions/getPlanningById';
import PlanningClient from './PlanningClient';

interface IParams {
    planningId?: string;
}

const PlanningPage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;
    const currentUser = await getCurrentUser();
    const planning = await getPlanningById(params);

    if (!planning) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Not Found"
                    subtitle="This meal plan does not exist."
                />
            </ClientOnly>
        );
    }

    const isOwner = currentUser?.id === planning.userId;

    if (planning.isPrivate && !isOwner) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Private Plan"
                    subtitle="This meal plan is private and only visible to its owner."
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <PlanningClient
                planning={planning}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
};

export default PlanningPage;

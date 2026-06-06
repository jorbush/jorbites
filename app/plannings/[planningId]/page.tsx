import { Metadata } from 'next';
import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getPlanningById from '@/app/actions/getPlanningById';
import PlanningClient from './PlanningClient';

interface IParams {
    planningId?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    const planning = await getPlanningById(params);

    if (!planning || planning.isPrivate) {
        return {
            title: 'Plan de comidas | Jorbites',
        };
    }

    return {
        title: `${planning.name} | Jorbites`,
        description:
            planning.description?.substring(0, 160) ||
            `Plan de comidas: ${planning.name} compartido en Jorbites`,
        alternates: {
            canonical: `/plannings/${params.planningId}`,
        },
    };
}

const PlanningPage = async (props: { params: Promise<IParams> }) => {
    const [params, currentUser] = await Promise.all([
        props.params,
        getCurrentUser(),
    ]);
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

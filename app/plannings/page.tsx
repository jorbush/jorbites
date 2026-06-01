import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getPlannings from '@/app/actions/getPlannings';
import PlanningsClient from '@/app/plannings/PlanningsClient';

export const metadata: Metadata = {
    title: 'Planes de Comidas | Jorbites',
    description:
        'Organiza tus comidas semanales, descubre planes de la comunidad y guarda tus favoritos en Jorbites.',
    alternates: {
        canonical: '/plannings',
    },
};

const PlanningsPage = async () => {
    const currentUser = await getCurrentUser();
    const { myPlannings, communityPlannings, savedPlannings } =
        await getPlannings();

    return (
        <ClientOnly>
            <PlanningsClient
                initialMyPlannings={myPlannings}
                initialCommunityPlannings={communityPlannings}
                initialSavedPlannings={savedPlannings}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
};

export default PlanningsPage;

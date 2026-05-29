import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getPlannings from '@/app/actions/getPlannings';
import PlanningsClient from '@/app/plannings/PlanningsClient';

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

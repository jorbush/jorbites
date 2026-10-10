import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import MealPlannerClient from './MealPlannerClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Meal Planner Course | Jorbites',
    description:
        'Learn how to build weekly meal plans, assign recipes to breakfast/lunch/dinner, generate automated shopping lists, and sync with external calendars.',
};

const MealPlannerPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(currentUser.id, 'meal-planner')
        : null;

    return (
        <MealPlannerClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default MealPlannerPage;

import getCurrentUser from '@/app/actions/getCurrentUser';
import MealPlannerClient from './MealPlannerClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Meal Planner Course | Jorbites',
    description:
        'Learn how to build weekly meal plans, assign recipes to breakfast/lunch/dinner, generate automated shopping lists, and sync with external calendars.',
};

const MealPlannerPage = async () => {
    const currentUser = await getCurrentUser();

    return <MealPlannerClient currentUser={currentUser} />;
};

export default MealPlannerPage;

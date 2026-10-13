import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import RecipeListsClient from './RecipeListsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Lists Course | Jorbites',
    description:
        'Learn how to create, manage, and share recipe lists and earn your badge.',
};

const RecipeListsPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(currentUser.id, 'recipe-lists')
        : null;

    return (
        <RecipeListsClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default RecipeListsPage;

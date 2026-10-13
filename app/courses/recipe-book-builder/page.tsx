import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import RecipeBookClient from './RecipeBookClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Book Builder Course | Jorbites',
    description:
        'Learn how to customize layouts, choose fonts, select recipes, and compile a custom recipe book PDF.',
};

const RecipeBookPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(
              currentUser.id,
              'recipe-book-builder'
          )
        : null;

    return (
        <RecipeBookClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default RecipeBookPage;

import Container from '@/app/components/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import EmptyState from '@/app/components/EmptyState';
import Pagination from '@/app/components/Pagination';
import { isMobile } from '@/app/utils/deviceDetector';
import getRecipes, { IRecipesParams } from '@/app/actions/getRecipes';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/ClientOnly';
import { headers } from 'next/headers';
import ErrorDisplay from './components/ErrorDisplay';

interface HomeProps {
    searchParams: Promise<IRecipesParams>;
}

const Home = async (props: HomeProps) => {
    const searchParams = await props.searchParams;
    const response = await getRecipes({
        ...(await Promise.resolve(searchParams)),
        limit: isMobile((await headers()).get('user-agent') || '') ? 6 : 10,
    });

    if (response.error) {
        return (
            <ClientOnly>
                <ErrorDisplay
                    code={response.error.code}
                    message={response.error.message}
                />
            </ClientOnly>
        );
    }

    const recipesData = response.data;
    const currentUser = await getCurrentUser();

    if (recipesData?.recipes.length === 0) {
        return (
            <ClientOnly>
                <EmptyState showReset />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <Container>
                <section aria-label="Recipes grid">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {recipesData?.recipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                data={recipe}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                </section>
                <nav aria-label="Pagination">
                    <Pagination
                        totalPages={recipesData?.totalPages || 1}
                        currentPage={recipesData?.currentPage || 1}
                        searchParams={searchParams}
                    />
                </nav>
            </Container>
        </ClientOnly>
    );
};

export default Home;

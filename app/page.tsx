import Container from '@/app/components/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import RecipeCardSkeleton from '@/app/components/recipes/RecipeCardSkeleton';
import EmptyState from '@/app/components/EmptyState';
import Pagination from '@/app/components/Pagination';
import { isMobile } from '@/app/utils/deviceDetector';
import getRecipes, { IRecipesParams } from '@/app/actions/getRecipes';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/ClientOnly';
import { headers } from 'next/headers';
import ErrorDisplay from './components/ErrorDisplay';
import { getFirstRecipeImageUrl } from './utils/imageOptimizer';
import LcpPreloader from './components/LcpPreloader';

interface HomeProps {
    searchParams: Promise<IRecipesParams>;
}

const RecipeGrid = () => (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array(12)
            .fill(0)
            .map((_, i) => (
                <RecipeCardSkeleton key={i} />
            ))}
    </div>
);

const Home = async ({ searchParams }: HomeProps) => {
    const resolvedParams = await searchParams;
    const response = await getRecipes({
        ...resolvedParams,
        limit: isMobile((await headers()).get('user-agent') || '') ? 6 : 10,
    });
    const firstImageUrl = getFirstRecipeImageUrl(response.data?.recipes);
    return (
        <ClientOnly
            fallback={
                <Container>
                    <section
                        aria-label="Loading"
                        className="min-h-[60vh]"
                    >
                        <RecipeGrid />
                    </section>
                </Container>
            }
        >
            <Container>
                {firstImageUrl && <LcpPreloader imageUrl={firstImageUrl} />}

                {response.error ? (
                    <div className="min-h-[60vh]">
                        <ErrorDisplay
                            code={response.error.code}
                            message={response.error.message}
                        />
                    </div>
                ) : response.data?.recipes.length === 0 ? (
                    <div className="min-h-[60vh]">
                        <EmptyState showReset />
                    </div>
                ) : (
                    <>
                        <section
                            aria-label="Recipes grid"
                            className="min-h-[60vh]"
                        >
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                {response.data?.recipes.map(
                                    async (recipe, index) => (
                                        <RecipeCard
                                            key={recipe.id}
                                            data={recipe}
                                            currentUser={await getCurrentUser()}
                                            isFirstCard={index === 0}
                                        />
                                    )
                                )}
                            </div>
                        </section>
                        <nav aria-label="Pagination">
                            <Pagination
                                totalPages={response.data?.totalPages || 1}
                                currentPage={response.data?.currentPage || 1}
                                searchParams={resolvedParams}
                            />
                        </nav>
                    </>
                )}
            </Container>
        </ClientOnly>
    );
};

export default Home;

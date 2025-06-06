import Container from '@/app/components/utils/Container';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import EmptyState from '@/app/components/utils/EmptyState';
import Pagination from '@/app/components/navigation/Pagination';
import { isMobile } from '@/app/utils/deviceDetector';
import getRecipes, { IRecipesParams } from '@/app/actions/getRecipes';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/utils/ClientOnly';
import { headers } from 'next/headers';
import ErrorDisplay from '@/app/components/utils/ErrorDisplay';
import { getFirstRecipeImageUrl } from '@/app/utils/imageOptimizer';
import LcpPreloader from '@/app/components/optimization/LcpPreloader';
import { RecipeGrid } from '@/app/components/recipes/RecipeGrid';
import { dynamicImport } from '@/app/utils/dynamicImport';
import {
    MOBILE_RECIPES_LIMIT,
    DESKTOP_RECIPES_LIMIT,
} from '@/app/utils/constants';

interface HomeProps {
    searchParams: Promise<IRecipesParams>;
}

const TopScroller = dynamicImport(
    () => import('@/app/components/utils/TopScroller')
);

const Home = async ({ searchParams }: HomeProps) => {
    const resolvedParams = await searchParams;
    const response = await getRecipes({
        ...resolvedParams,
        limit: isMobile((await headers()).get('user-agent') || '')
            ? MOBILE_RECIPES_LIMIT
            : DESKTOP_RECIPES_LIMIT,
    });
    const firstImageUrl = getFirstRecipeImageUrl(response.data?.recipes);
    const currentUser = await getCurrentUser();
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
                <TopScroller />
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
                                {response.data?.recipes.map((recipe, index) => (
                                    <RecipeCard
                                        key={recipe.id}
                                        data={recipe}
                                        currentUser={currentUser}
                                        isFirstCard={index === 0}
                                    />
                                ))}
                            </div>
                        </section>
                        <Pagination
                            totalPages={response.data?.totalPages || 1}
                            currentPage={response.data?.currentPage || 1}
                            searchParams={resolvedParams}
                        />
                    </>
                )}
            </Container>
        </ClientOnly>
    );
};

export default Home;

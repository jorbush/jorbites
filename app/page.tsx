import Container from "@/app/components/Container";
import RecipeCard from "@/app/components/recipes/RecipeCard";
import EmptyState from "@/app/components/EmptyState";
import Pagination from "@/app/components/Pagination";
import { isMobile as detectMobile } from "@/app/utils/deviceDetector";
import getRecipes, { IRecipesParams } from "@/app/actions/getRecipes";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "./components/ClientOnly";
import { headers } from 'next/headers';

interface HomeProps {
  searchParams: IRecipesParams
};

const Home = async ({ searchParams }: HomeProps) => {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = detectMobile(userAgent);
  const limit = isMobile ? 6 : 10;
  const recipesData = await getRecipes({ ...searchParams, limit });
  const currentUser = await getCurrentUser();

  if (recipesData.recipes.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-8
          "
        >
          {recipesData.recipes.map((listing) => (
            <RecipeCard
              key={listing.id}
              data={listing}
              currentUser={currentUser}
            />
          ))}
        </div>
        <Pagination
          totalPages={recipesData.totalPages}
          currentPage={recipesData.currentPage}
          searchParams={searchParams}
        />
      </Container>
    </ClientOnly>
  )
}

export default Home;

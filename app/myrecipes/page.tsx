
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getFavoriteListings from "@/app/actions/getFavoriteListings";

import MyRecipesClient from "./MyRecipesClient";
import getMyRecipes from "../actions/getMyRecipes";

const ListingPage = async () => {
  const listings = await getMyRecipes();
  const currentUser = await getCurrentUser();

  if (listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No recipes found"
          subtitle="Looks like you have not created recipes."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <MyRecipesClient
        listings={listings}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
}
 
export default ListingPage;
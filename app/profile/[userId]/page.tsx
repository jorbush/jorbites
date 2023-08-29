
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getFavoriteListings from "@/app/actions/getFavoriteListings";

import ProfileClient from "./ProfileClient";
import getRecipesByUserId from "../../actions/getRecipesByUserId";
import getUserById from "@/app/actions/getUserById";
import ProfileHeader from "./ProfileHeader";

interface IParams {
  userId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {
  const listings = await getRecipesByUserId(params);
  const user = await getUserById(params);
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
      <ProfileHeader user={user}/>
      <ProfileClient
        listings={listings}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
}
 
export default ListingPage;
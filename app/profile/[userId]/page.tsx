
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

  if (!user && listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No recipes found"
          subtitle="Looks like this user has not created recipes."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ProfileHeader user={user}/>
      {listings.length > 0 && <ProfileClient
          listings={listings}
          currentUser={currentUser}
        />
      }
      {listings.length === 0 && <EmptyState
        title="No recipes found"
        subtitle="Looks like this user has not created recipes."
      />
      }
    </ClientOnly>
  );
}
 
export default ListingPage;
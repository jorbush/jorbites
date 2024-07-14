
import getCurrentUser from "@/app/actions/getCurrentUser";
import getRecipeById from "@/app/actions/getRecipeById";

import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import ListingClient from "./ListingClient";
import getCommentsByRecipeId from "@/app/actions/getCommentsByRecipeId";


interface IParams {
  listingId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {

  const listing = await getRecipeById(params);
  const currentUser = await getCurrentUser();
  const comments = await getCommentsByRecipeId(params);

  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ListingClient
        listing={listing}
        currentUser={currentUser}
        comments={comments}
      />
    </ClientOnly>
  );
}

export default ListingPage;

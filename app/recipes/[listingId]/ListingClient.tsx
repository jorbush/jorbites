'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeComment, SafeListing, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import ListingHead from "@/app/components/listings/ListingHead";
import { Comment } from "@prisma/client";
import ListingInfo from "@/app/components/listings/ListingInfo";
import { preparationMethods } from "@/app/components/modals/RecipeModal";
import Comments from "@/app/components/comments/Comments";
import DeleteListingButton from "@/app/components/listings/DeleteListingButton";

interface ListingClientProps {
  comments?: SafeComment[];
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  currentUser,
  comments
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const category = useMemo(() => {
     return categories.find((item) => 
      item.label === listing.category);
  }, [listing.category]);

  const method = useMemo(() => {
    return preparationMethods.find((item) => 
     item.label === listing.method);
 }, [listing.method]);

  const onCreateComment = useCallback((comment: string) => {
      if (!currentUser) {
        return loginModal.onOpen();
      }
      setIsLoading(true);
      
      axios.post('/api/comments', {
        comment: comment,
        listingId: listing?.id
      })
      .then(() => {
        toast.success('Recipe commented!');
      })
      .catch(() => {
        toast.error('Something went wrong.');
      })
      .finally(() => {
        setIsLoading(false);
        router.refresh()
      })
  },
  [
    listing?.id,
    router,
    currentUser,
    loginModal
  ]);

  return ( 
    <Container>
      <div 
        className="
          max-w-screen-lg 
          mx-auto
        "
      >
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            minutes={listing.minutes.toString()}
            imageSrc={listing.imageSrc}
            id={listing.id}
            currentUser={currentUser}
          />
            <div 
            className="
              grid 
              grid-cols-1 
              md:grid-cols-1
              md:gap-10 
              mt-1
            " >
                <ListingInfo
                    id={listing.id}
                    user={listing.user}
                    likes={listing.numLikes}
                    currentUser={currentUser}
                    category={category}
                    method={method}
                    description={listing.description}
                    ingredients={listing.ingredients}
                    steps={listing.steps}
                />
                
          </div>
          <Comments 
            currentUser={currentUser} 
            onCreateComment={onCreateComment} 
            listingId={listing.id}
            comments={comments}
          />
          {currentUser?.id === listing.userId&&(
            <DeleteListingButton id={listing.id}/>
          )}
        </div>
      </div>
    </Container>
   );
}
 
export default ListingClient;
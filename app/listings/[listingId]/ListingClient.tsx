'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import ListingHead from "@/app/components/listings/ListingHead";
import { Comment } from "@prisma/client";
import ListingInfo from "@/app/components/listings/ListingInfo";
import { preparationMethods } from "@/app/components/modals/RecipeModal";

interface ListingClientProps {
  comments?: Comment[];
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  currentUser
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const category = useMemo(() => {
     return categories.find((item) => 
      item.label === listing.category);
  }, [listing.category]);

  const method = useMemo(() => {
    return preparationMethods.find((item) => 
     item.label === listing.method);
 }, [listing.method]);

  const [isLoading, setIsLoading] = useState(false);
/*
  const onCreateComment = useCallback(() => {
      if (!currentUser) {
        return loginModal.onOpen();
      }
      setIsLoading(true);
      
      axios.post('/api/comments', {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id
      })
      .then(() => {
        toast.success('Listing commented!');
      })
      .catch(() => {
        toast.error('Something went wrong.');
      })
      .finally(() => {
        setIsLoading(false);
      })
  },
  [
    totalPrice, 
    dateRange, 
    listing?.id,
    router,
    currentUser,
    loginModal
  ]);*/

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
              md:grid-cols-7 
              md:gap-10 
              mt-6
            " >
                <ListingInfo
                    user={listing.user}
                    category={category}
                    method={method}
                    description={listing.description}
                    ingredients={listing.ingredients}
                    steps={listing.steps}
                />
            {/* <div 
              className="
                order-first 
                mb-10 
                md:order-last 
                md:col-span-3
              "
            >
              <ListingReservation
                price={listing.price}
                totalPrice={totalPrice}
                onChangeDate={(value) => setDateRange(value)}
                dateRange={dateRange}
                onSubmit={onCreateComment}
                disabled={isLoading}
                disabledDates={disabledDates}
              />
            </div> */}
          </div>
        </div>
      </div>
    </Container>
   );
}
 
export default ListingClient;
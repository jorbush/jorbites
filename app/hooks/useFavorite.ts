import axios from "axios";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { SafeUser } from "@/app/types";

import useLoginModal from "./useLoginModal";

interface IUseFavorite {
  listingId: string;
  currentUser?: SafeUser | null;
}

const useFavorite = ({ listingId, currentUser}: IUseFavorite) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const loginModal = useLoginModal();

  const hasFavorited = useMemo(() => {
    const list = currentUser?.favoriteIds || [];

    return list.includes(listingId);
  }, [currentUser, listingId]);

  const toggleFavorite = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (isLoading){
      return
    }

    if (!currentUser) {
      return loginModal.onOpen();
    }

    setIsLoading(true)

    try {
      let request;
      let requestLike;

      if (hasFavorited) {
        request = () => axios.delete(`/api/favorites/${listingId}`);
        requestLike = () => axios.post(`/api/listing/${listingId}`, {operation: "decrement"});
      } else {
        request = () => axios.post(`/api/favorites/${listingId}`);
        requestLike = () => axios.post(`/api/listing/${listingId}`, {operation: "increment"});
      }
      
      await requestLike();
      await request();
      router.refresh();
      toast.success('Success');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, 
  [
    currentUser, 
    hasFavorited, 
    listingId, 
    loginModal,
    router
  ]);

  return {
    hasFavorited,
    toggleFavorite,
  }
}

export default useFavorite;
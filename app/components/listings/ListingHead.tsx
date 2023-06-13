'use client';

import Image from "next/image";
import { useState } from "react";
import { FiChevronLeft, FiShare2 } from "react-icons/fi";

import { SafeUser } from "@/app/types";
import Heading from "../Heading";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ListingHeadProps {
  title: string;
  minutes: string;
  imageSrc: string;
  id: string;
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({
  title,
  minutes,
  imageSrc,
  id,
  currentUser,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter()

  const copyToClipboard = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL);
    setIsCopied(true);
    toast.success("URL copied");
  };

  const share = () => {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          url: window.location.href,
        })
        .then(() => {
          console.log("Successfully shared");
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between sm:ml-4 sm:mr-4">
        <button
          className="mr-4 flex items-center space-x-2 text-gray-600 dark:text-neutral-100 focus:outline-none"
          onClick={() => router.back()}
        >
          <FiChevronLeft className="text-xl" />
        </button>
        <Heading title={title} subtitle={`${minutes} min`} center/>
        <button
          className="ml-4 flex items-center space-x-2 text-gray-600 dark:text-neutral-100 focus:outline-none"
          onClick={share}
        >
          <FiShare2 className="text-xl" />
        </button>
      </div>
      <div className="w-full h-[60vh] overflow-hidden rounded-xl relative">
        <Image src={imageSrc} fill className="object-cover w-full" alt="Image" />
      </div>
    </>
  );
};

export default ListingHead;


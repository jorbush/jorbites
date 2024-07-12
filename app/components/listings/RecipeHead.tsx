'use client';

import Image from "next/image";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiShare2 } from "react-icons/fi";

import { SafeUser } from "@/app/types";
import Heading from "../Heading";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface RecipeHeadProps {
  title: string;
  minutes: string;
  imagesSrc: string[];
  id: string;
  currentUser?: SafeUser | null;
}

const RecipeHead: React.FC<RecipeHeadProps> = ({
  title,
  minutes,
  imagesSrc,
  id,
  currentUser,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

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

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imagesSrc.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imagesSrc.length - 1 ? 0 : prevIndex + 1
    );
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
        <Heading title={title} subtitle={`${minutes} min`} center />
        <button
          className="ml-4 flex items-center space-x-2 text-gray-600 dark:text-neutral-100 focus:outline-none"
          onClick={share}
        >
          <FiShare2 className="text-xl" />
        </button>
      </div>
      <div className="relative w-full h-[60vh] overflow-hidden rounded-xl">
        <Image
          src={imagesSrc[currentImageIndex]}
          fill
          priority={true}
          className="object-cover"
          alt="Image"
          sizes="(max-width: 768px) 100vw,
                 (max-width: 1200px) 50vw,
                 33vw"
        />
        {imagesSrc.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-center"
              onClick={goToPreviousImage}
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <FiChevronLeft className="text-2xl text-white cursor-pointer" />
              </div>
            </div>
            <div
              className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-center"
              onClick={goToNextImage}
            >
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FiChevronRight className="text-2xl text-white cursor-pointer" />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RecipeHead;

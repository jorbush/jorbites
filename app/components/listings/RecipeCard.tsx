'use client';

import { SafeListing, SafeUser } from "@/app/types";
import { Listing } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Button from "../Button";
import Image from "next/image";
import HeartButton from "../HeartButton";

interface ListingCardProps {
    data: SafeListing;
    onAction?: (id: string) => void;
    disabled?: boolean;
    actionLabel?: string;
    actionId?: string;
    currentUser?: SafeUser | null;
}

const RecipeCard: React.FC<ListingCardProps> = ({
    data,
    onAction,
    disabled,
    actionLabel,
    actionId = "",
    currentUser
}) => {
    const router = useRouter()

    const handleCancel = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()

        if(disabled){
            return;
        }

        onAction?.(actionId)

    }, [onAction, actionId, disabled])



    return (
        <div
            onClick={() => router.push(`/recipes/${data.id}`)}
            className="col-span-1 cursor-pointer group"
        >
        <div className="flex flex-col gap-2 w-full">
            <div
            className="
                aspect-square
                w-full
                relative
                overflow-hidden
                rounded-xl
            "
            >
                <Image
                    fill
                    priority={true}
                    className="
                        object-cover
                        h-full
                        w-full
                        group-hover:scale-110
                        transition
                    "
                    src={data.imageSrc}
                    alt="recipe"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="
                    absolute
                    top-3
                    right-3
                ">
                    <HeartButton
                        listingId={data.id}
                        currentUser={currentUser}
                    />
                </div>
            </div>
            <div className="font-semibold text-lg dark:text-neutral-100">
                { data.title }
            </div>
            <div className="font-light text-neutral-500">
            {data.minutes} min
            </div>
            {/*
            <div className="flex flex-row items-center gap-1">
                <div className="font-semibold">
                    { data.category}
                </div>
            </div>*/}
            {onAction && actionLabel && (
            <Button
                disabled={disabled}
                small
                label={actionLabel}
                onClick={handleCancel}
            />
            )}
        </div>
    </div>
   );
}

export default RecipeCard

'use client';

import { SafeUser } from "@/app/types";
import { Listing } from "@prisma/client";
import { useRouter } from "next/navigation";

interface ListingCardProps {
    data: Listing;
    onAction?: (id: string) => void;
    disabled?: boolean;
    actionLabel?: string;
    actionId?: string;
    currentUser?: SafeUser | null;
}

const ListingCard: React.FC<ListingCardProps> = ({
    data,
    onAction,
    disabled,
    actionLabel,
    actionId,
    currentUser
}) => {
    const router = useRouter()
    
    return (
        <div>
            Listing Card
        </div>
    );
}

export default ListingCard
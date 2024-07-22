import {
    AiFillHeart,
    AiOutlineHeart,
} from 'react-icons/ai';
import { SafeUser } from '@/app/types';
import { useState, useEffect } from 'react';
import useFavorite from '@/app/hooks/useFavorite';

interface HeartButtonProps {
    recipeId: string;
    currentUser?: SafeUser | null;
}

const HeartButton: React.FC<HeartButtonProps> = ({
    recipeId,
    currentUser,
}) => {
    const { hasFavorited, toggleFavorite } = useFavorite({
        recipeId,
        currentUser,
    });

    const [isDisabled, setIsDisabled] = useState(false);

    const handleButtonClick = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if (!isDisabled) {
            toggleFavorite(e);
            setIsDisabled(true);
        }
    };

    useEffect(() => {
        if (isDisabled) {
            const timeout = setTimeout(() => {
                setIsDisabled(false);
            }, 4000);

            return () => clearTimeout(timeout);
        }
    }, [isDisabled]);

    return (
        <div
            onClick={handleButtonClick}
            className="relative cursor-pointer transition hover:opacity-80"
        >
            <AiOutlineHeart
                size={28}
                className="absolute -right-[2px] -top-[2px] fill-white"
            />
            <AiFillHeart
                size={24}
                className={
                    hasFavorited
                        ? 'fill-green-450'
                        : 'fill-neutral-500/70'
                }
                style={{
                    pointerEvents: isDisabled
                        ? 'none'
                        : 'auto',
                }}
            />
        </div>
    );
};

export default HeartButton;

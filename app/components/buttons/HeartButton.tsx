import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { SafeUser } from '@/app/types';
import { useState, useEffect } from 'react';
import useFavorite from '@/app/hooks/useFavorite';

interface HeartButtonProps {
    recipeId: string;
    currentUser?: SafeUser | null;
    likes?: number;
    showLikes?: boolean;
}

const HeartButton: React.FC<HeartButtonProps> = ({
    recipeId,
    currentUser,
    likes,
    showLikes = true,
}) => {
    const { hasFavorited, optimisticLikes, toggleFavorite } = useFavorite({
        recipeId,
        currentUser,
        likes,
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

    const heartIcon = (
        <div
            onClick={handleButtonClick}
            className="relative cursor-pointer transition hover:opacity-80"
            data-cy="heart-button"
        >
            <AiOutlineHeart
                size={28}
                className="absolute -top-[2px] -right-[2px] fill-white"
            />
            <AiFillHeart
                data-testid="heart-button"
                size={24}
                className={
                    hasFavorited ? 'fill-green-450' : 'fill-neutral-500/70'
                }
                style={{
                    pointerEvents: isDisabled ? 'none' : 'auto',
                }}
            />
        </div>
    );

    if (likes === undefined || !showLikes) {
        return heartIcon;
    }

    return (
        <div className="flex flex-row items-end gap-2 text-xl">
            {heartIcon}
            <div
                className="dark:text-neutral-100"
                data-cy="recipe-num-likes"
                data-testid="recipe-num-likes"
            >
                {optimisticLikes}
            </div>
        </div>
    );
};

export default HeartButton;

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
    likes = 0,
    showLikes = false,
}) => {
    const { hasFavorited, toggleFavorite, likesCount, isLoading } = useFavorite(
        {
            recipeId,
            currentUser,
            likes,
        }
    );

    const [isDisabled, setIsDisabled] = useState(false);

    const handleButtonClick = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if (!isDisabled && !isLoading) {
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
        <div className="flex flex-row items-center gap-2">
            <div
                onClick={handleButtonClick}
                className="relative cursor-pointer transition hover:opacity-80"
                data-cy="heart-button"
            >
                <AiOutlineHeart
                    data-testid="outline-heart"
                    size={28}
                    className="absolute -top-[2px] -right-[2px] fill-white"
                />
                <AiFillHeart
                    data-testid="filled-heart"
                    size={24}
                    className={
                        hasFavorited ? 'fill-green-450' : 'fill-neutral-500/70'
                    }
                    style={{
                        pointerEvents: isDisabled || isLoading ? 'none' : 'auto',
                    }}
                />
            </div>
            {showLikes && (
                <div
                    className="dark:text-neutral-100"
                    data-cy="recipe-num-likes"
                >
                    {likesCount}
                </div>
            )}
        </div>
    );
};

export default HeartButton;

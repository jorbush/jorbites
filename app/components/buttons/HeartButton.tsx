import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { SafeUser } from '@/app/types';
import { useState, useEffect } from 'react';
import useFavorite from '@/app/hooks/useFavorite';

interface HeartButtonProps {
    recipeId: string;
    currentUser?: SafeUser | null;
}

const HeartButton: React.FC<HeartButtonProps> = ({ recipeId, currentUser }) => {
    const { hasFavorited, toggleFavorite } = useFavorite({
        recipeId,
        currentUser,
    });

    const [isDisabled, setIsDisabled] = useState(false);

    const handleButtonClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        if (!isDisabled) {
            toggleFavorite(e as any);
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
        <button
            type="button"
            onClick={handleButtonClick}
            className="relative cursor-pointer border-0 bg-transparent p-0 transition hover:opacity-80 focus:outline-hidden"
            data-cy="heart-button"
            aria-label={
                hasFavorited ? 'Remove from favorites' : 'Add to favorites'
            }
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
        </button>
    );
};

export default HeartButton;

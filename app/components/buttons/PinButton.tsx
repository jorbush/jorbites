'use client';

import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import { SafeUser } from '@/app/types';
import { useState, useEffect } from 'react';
import usePin from '@/app/hooks/usePin';

interface PinButtonProps {
    recipeId: string;
    currentUser?: SafeUser | null;
}

const PinButton: React.FC<PinButtonProps> = ({ recipeId, currentUser }) => {
    const { isPinned, togglePin, isLoading } = usePin({
        recipeId,
        currentUser,
    });

    const [isDisabled, setIsDisabled] = useState(false);

    const handleButtonClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        if (!isDisabled && !isLoading) {
            togglePin(e);
            setIsDisabled(true);
        }
    };

    useEffect(() => {
        if (isDisabled) {
            const timeout = setTimeout(() => {
                setIsDisabled(false);
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [isDisabled]);

    return (
        <button
            onClick={handleButtonClick}
            disabled={isDisabled || isLoading}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/80 transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-75 dark:bg-neutral-800/80 dark:hover:bg-neutral-800"
            title={isPinned ? 'Unpin' : 'Pin'}
            data-cy="pin-button"
            style={{
                pointerEvents: isDisabled || isLoading ? 'none' : 'auto',
            }}
        >
            {isPinned ? (
                <BsPinAngleFill
                    data-testid="pin-filled"
                    size={18}
                    className="fill-green-450 text-green-450"
                />
            ) : (
                <BsPinAngle
                    data-testid="pin-outline"
                    size={18}
                    className="text-neutral-700 dark:text-neutral-200"
                />
            )}
        </button>
    );
};

export default PinButton;

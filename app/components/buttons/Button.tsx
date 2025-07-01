import { IconType } from 'react-icons';
import { useState } from 'react';

/* eslint-disable unused-imports/no-unused-vars */
interface ButtonProps {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    outline?: boolean;
    small?: boolean;
    icon?: IconType;
    withDelay?: boolean;
    deleteButton?: boolean;
    dataCy?: string;
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    disabled,
    outline,
    small,
    icon: Icon,
    withDelay = false,
    deleteButton,
    dataCy,
}) => {
    const [isDisabled, setIsDisabled] = useState(false);
    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !isDisabled) {
            onClick(e);
            if (withDelay) {
                setIsDisabled(true);
                setTimeout(() => {
                    setIsDisabled(false);
                }, 2000);
            }
        }
    };

    return (
        <button
            disabled={disabled || isDisabled}
            onClick={handleButtonClick}
            className={`relative w-full cursor-pointer rounded-lg transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70 ${outline ? 'dark:bg-dark bg-white' : 'bg-green-450'} ${outline ? 'border-black dark:border-neutral-100' : 'border-green-450'} ${outline ? 'text-black dark:text-neutral-100' : 'dark:text-dark text-white'} ${small ? 'text-sm' : 'text-md'} ${small ? 'py-1' : 'py-3'} ${small ? 'font-light' : 'font-semibold'} ${small ? 'border-[1px]' : 'border-2'} ${deleteButton ? 'border-rose-500 bg-rose-500 text-neutral-100' : ''} `}
            data-cy={dataCy}
        >
            {Icon && (
                <Icon
                    size={24}
                    className="absolute top-3 left-4"
                    data-testid="button-icon"
                />
            )}
            {label}
        </button>
    );
};

export default Button;

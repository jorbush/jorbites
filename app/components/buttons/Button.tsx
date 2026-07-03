import { IconType } from 'react-icons';
import { useState } from 'react';

/* eslint-disable unused-imports/no-unused-vars */
interface ButtonProps {
    label: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    outline?: boolean;
    small?: boolean;
    icon?: IconType;
    withDelay?: boolean;
    deleteButton?: boolean;
    rose?: boolean;
    dataCy?: string;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick = () => {},
    disabled,
    outline,
    small,
    icon: Icon,
    withDelay = false,
    deleteButton,
    rose,
    dataCy,
    type = 'button',
    className,
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

    const getRoseButtonClasses = () => {
        if (rose || deleteButton) {
            return 'bg-rose-500 text-white hover:bg-rose-600 hover:opacity-100';
        }
        return '';
    };

    const getBaseClasses = () => {
        if (rose) {
            // Rose buttons use a simpler, inline style
            const padding = small ? 'px-6 py-2' : 'px-6 py-3';
            return `cursor-pointer rounded-lg ${padding} transition disabled:cursor-not-allowed disabled:opacity-70 ${Icon ? 'flex items-center justify-center gap-2' : ''}`;
        }
        // Default modal button style
        const baseModalClasses =
            'relative w-full cursor-pointer rounded-lg transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70';
        const colorClasses = outline ? 'dark:bg-dark bg-white' : 'bg-green-450';
        const borderClasses = outline
            ? 'border-black dark:border-neutral-100'
            : 'border-green-450';
        const textClasses = outline
            ? 'text-black dark:text-neutral-100'
            : 'dark:text-dark text-white';
        const pyClass = className?.includes('py-') ? '' : 'py-3';
        const sizeClasses = small
            ? 'rounded-md border px-3 py-2 text-sm font-medium'
            : `text-md w-full rounded-lg border-2 ${pyClass} font-semibold`;
        const deleteClasses = deleteButton ? 'border-rose-500' : '';

        return `${baseModalClasses} ${colorClasses} ${borderClasses} ${textClasses} ${sizeClasses} ${deleteClasses}`;
    };

    return (
        <button
            type={type}
            disabled={disabled || isDisabled}
            onClick={handleButtonClick}
            className={`${getBaseClasses()} ${getRoseButtonClasses()} ${className || ''}`}
            data-cy={dataCy}
            data-testid={dataCy || 'button-component'}
            suppressHydrationWarning
        >
            {Icon && (
                <Icon
                    size={rose ? 20 : 24}
                    className={rose ? '' : 'absolute top-3 left-4'}
                    data-testid="button-icon"
                />
            )}
            {label}
        </button>
    );
};

export default Button;

'use client';

import { IconType } from 'react-icons';

interface ButtonProps {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    outline?: boolean;
    small?: boolean;
    icon?: IconType;
    rose?: boolean;
    custom?: string;
    ariaLabel?: string;
    dataCy?: string;
}

const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    disabled,
    outline,
    small,
    icon: Icon,
    rose,
    custom,
    ariaLabel,
    dataCy,
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            data-cy={dataCy}
            className={`relative flex items-center justify-center gap-2 rounded-lg transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70
    ${
        outline
            ? 'border-black bg-white text-black'
            : rose
            ? 'border-rose-500 bg-rose-500 text-white'
            : 'border-primary bg-primary text-white'
    }
    ${
        small
            ? 'border-[1px] py-1 text-sm font-light'
            : 'border-2 py-3 text-md font-semibold'
    }
    ${custom}
`}
        >
            {Icon && <Icon size={24} />}
            {label}
        </button>
    );
};

export default Button;

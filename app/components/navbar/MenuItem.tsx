'use client';
import { MdFiberNew } from 'react-icons/md';
import { IconType } from 'react-icons';
import Avatar from '../utils/Avatar';

interface MenuItemProps {
    onClick: () => void;
    label: string;
    extraClasses?: string;
    isNew?: boolean;
    dataCy?: string;
    icon?: IconType;
    avatarSrc?: string | null;
}

const MenuItem: React.FC<MenuItemProps> = ({
    onClick,
    label,
    extraClasses,
    isNew,
    dataCy,
    icon: Icon,
    avatarSrc,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`block w-full cursor-pointer border-0 bg-transparent p-3 text-left font-semibold transition hover:bg-neutral-100 hover:text-black focus:outline-hidden ${extraClasses}`}
            data-cy={dataCy}
        >
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Render Avatar if avatarSrc is provided, otherwise fall back to Icon if available */}
                    {avatarSrc ? (
                        <Avatar
                            src={avatarSrc}
                            size={20}
                            quality="auto:eco"
                        />
                    ) : Icon ? (
                        <Icon
                            size={20}
                            className="flex-shrink-0"
                        />
                    ) : null}
                    <span className="flex items-center justify-between whitespace-nowrap">
                        {label}
                    </span>
                </div>
                {isNew && (
                    <MdFiberNew
                        className="text-green-450 ml-2 flex-shrink-0"
                        size={25}
                    />
                )}
            </div>
        </button>
    );
};

export default MenuItem;

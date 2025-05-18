'use client';
import { MdFiberNew } from 'react-icons/md';
import { IconType } from 'react-icons';

interface MenuItemProps {
    onClick: () => void;
    label: string;
    extraClasses?: string;
    isNew?: boolean;
    dataCy?: string;
    icon?: IconType;
}

const MenuItem: React.FC<MenuItemProps> = ({
    onClick,
    label,
    extraClasses,
    isNew,
    dataCy,
    icon: Icon,
}) => {
    return (
        <div
            onClick={onClick}
            className={`p-3 font-semibold transition hover:bg-neutral-100 hover:text-black ${extraClasses}`}
            data-cy={dataCy}
        >
            <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <Icon
                            size={20}
                            className="flex-shrink-0"
                        />
                    )}
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
        </div>
    );
};

export default MenuItem;

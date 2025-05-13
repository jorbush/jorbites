'use client';
import { MdFiberNew } from 'react-icons/md';

interface MenuItemProps {
    onClick: () => void;
    label: string;
    extraClasses?: string;
    isNew?: boolean;
    dataCy?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
    onClick,
    label,
    extraClasses,
    isNew,
    dataCy,
}) => {
    return (
        <div
            onClick={onClick}
            className={`p-3 font-semibold transition hover:bg-neutral-100 hover:text-black ${extraClasses}`}
            data-cy={dataCy}
        >
            <div className="flex items-center justify-between">
                {label}
                {isNew && (
                    <MdFiberNew
                        className="text-green-450"
                        size={25}
                    />
                )}
            </div>
        </div>
    );
};

export default MenuItem;

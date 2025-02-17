'use client';
import { MdFiberNew } from 'react-icons/md';

interface MenuItemProps {
    onClick: () => void;
    label: string;
    props?: string;
    isNew?: boolean;
    dataCy?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
    onClick,
    label,
    props,
    isNew,
    dataCy,
}) => {
    return (
        <div
            onClick={onClick}
            className={`px-4 py-3 font-semibold transition hover:bg-neutral-100 hover:text-black ${props}`}
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

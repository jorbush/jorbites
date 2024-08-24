'use client';

interface MenuItemProps {
    onClick: () => void;
    label: string;
    dataCy?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, label, dataCy }) => {
    return (
        <div
            onClick={onClick}
            className="px-4 py-3 font-semibold transition hover:bg-neutral-100 hover:text-black"
            data-cy={dataCy}
        >
            {label}
        </div>
    );
};

export default MenuItem;

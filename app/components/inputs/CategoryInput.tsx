'use client';

import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';

/* eslint-disable unused-imports/no-unused-vars */
interface CategoryBoxProps {
    icon: IconType;
    label: string;
    selected?: boolean;
    onClick: (value: string) => void;
    dataCy?: string;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
    icon: Icon,
    label,
    selected,
    onClick,
    dataCy,
}) => {
    const { t } = useTranslation();

    return (
        <div
            onClick={() => onClick(label)}
            className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition hover:border-black ${selected ? 'selected border-black' : 'border-neutral-200'} `}
            data-cy={dataCy}
        >
            <Icon size={30} />
            <div className="font-semibold">{t(label.toLocaleLowerCase())}</div>
        </div>
    );
};

export default CategoryBox;

'use client';

import { IconType } from "react-icons";
import { useTranslation } from 'react-i18next';

interface CategoryBoxProps {
  icon: IconType,
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  icon: Icon,
  label,
  selected,
  onClick
}) => {
  const { t } = useTranslation();

  return ( 
    <div
      onClick={() => onClick(label)}
      className={`
        rounded-xl
        border-2
        p-4
        flex
        flex-col
        gap-3
        hover:border-black
        transition
        cursor-pointer
        ${selected ? 'border-black' : 'border-neutral-200'}
      `}
    >
      <Icon size={30} />
      <div className="font-semibold">
        {t(label.toLocaleLowerCase())}
      </div>
    </div>
   );
}
 
export default CategoryBox;
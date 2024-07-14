'use client';

import { IconType } from "react-icons";
import { useTranslation } from 'react-i18next';

interface CategoryViewProps {
  icon: IconType,
  label: string,
  description: string
}

const CategoryView: React.FC<CategoryViewProps> = ({ 
  icon: Icon,
  label,
  description
 }) => {
  const { t } = useTranslation();
  return ( 
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center gap-4">
        <Icon size={40} className="text-neutral-600" />
        <div className="flex flex-col">
            <div 
              className="text-lg font-semibold"
            >
              {t(label.toLocaleLowerCase())}
            </div>
            <div 
              className="text-neutral-500 font-light"
            >
              {description}
            </div>
        </div>
      </div>
    </div>
   );
}
 
export default CategoryView;
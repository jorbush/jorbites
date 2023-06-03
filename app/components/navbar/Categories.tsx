'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { TbBeach, TbMountain, TbPool } from 'react-icons/tb';
import { 
  GiGrain, 
  GiChicken, 
  GiAvocado,
  GiSalmon
} from 'react-icons/gi';

import {FaFish} from 'react-icons/fa';

import Container from '../Container';
import CategoryBox from '../CategoryBox';


export const categories = [
    {
        label: 'Avocado',
        icon: GiAvocado,
        description: 'Recipes with avocado',
    },
    {
        label: 'Oat',
        icon: GiGrain,
        description: 'Recipes with oat',
    },
    {
        label: 'Chicken',
        icon: GiChicken,
        description: 'Recipes with chicken',
    },
    {
        label: 'Salmon',
        icon: GiSalmon,
        description: 'Recipes with salmon',
    },
    {
        label: 'Fish',
        icon: FaFish,
        description: 'Recipes with chicken',
    },
]

const Categories = () => {
  const params = useSearchParams();
  const category = params?.get('category');
  const pathname = usePathname();
  const isMainPage = pathname === '/';

  if (!isMainPage) {
    return null;
  }

  return (
    <Container>
      <div
        className="
          pt-4
          flex 
          flex-row 
          items-center 
          overflow-x-auto
        "
      >
        {categories.map((item) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
            selected={category === item.label}
          />
        ))}
      </div>
    </Container>
  );
}
 
export default Categories;
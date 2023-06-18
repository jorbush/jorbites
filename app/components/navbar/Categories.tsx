'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Container from '../Container';
import CategoryBox from '../CategoryBox';
import { 
  GiLindenLeaf,
  GiAvocado,
  GiCakeSlice,
  GiPizzaSlice,
  GiCoffeeCup,
  GiMeat,
  GiBowlOfRice,
} from 'react-icons/gi';
import {FaFish} from 'react-icons/fa';
import { TbSoup, TbSalad } from "react-icons/tb";

export const categories = [
  {
    label: 'Fruits',
    icon: GiAvocado,
    description: 'Recipes with fresh fruits',
  },
  {
    label: 'Vegetarian',
    icon: GiLindenLeaf,
    description: 'Vegetarian recipes',
  },
  {
    label: 'Seafood',
    icon: FaFish,
    description: 'Seafood recipes',
  },
  {
    label: 'Meat',
    icon: GiMeat,
    description: 'Meat recipes',
  },
  {
    label: 'Legumes',
    icon: GiBowlOfRice,
    description: 'Recipes with legumes',
  },
  {
    label: 'Desserts',
    icon: GiCakeSlice,
    description: 'Delicious desserts',
  },
  {
    label: 'Pizza',
    icon: GiPizzaSlice,
    description: 'Pizza recipes',
  },
  {
    label: 'Soup',
    icon: TbSoup,
    description: 'Soup recipes',
  },
  {
    label: 'Drinks',
    icon: GiCoffeeCup,
    description: 'Refreshing drinks',
  },
  {
    label: 'Salad',
    icon: TbSalad,
    description: 'Salad recipes',
  },
];


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
          justify-between
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
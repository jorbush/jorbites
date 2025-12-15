'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Container from '@/app/components/utils/Container';
import CategoryBox from '@/app/components/CategoryBox';
import {
    GiLindenLeaf,
    GiAvocado,
    GiCakeSlice,
    GiPizzaSlice,
    GiCoffeeCup,
    GiMeat,
    GiBowlOfRice,
    GiTrophyCup,
} from 'react-icons/gi';
import { FaFish } from 'react-icons/fa';
import { TbSoup, TbSalad } from 'react-icons/tb';
import { PiBowlFoodFill } from 'react-icons/pi';
import { LuVegan } from 'react-icons/lu';
import { IconPasta } from '@/app/components/icons/IconPasta';
import { UnsaltedIcon } from '@/app/components/icons/UnsaltedIcon';
import { GlutenFreeIcon } from '@/app/components/icons/GlutenFreeIcon';
import { IconBreakfast } from '../icons/IconBreakfast';

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
        label: 'Rice',
        icon: GiBowlOfRice,
        description: 'Recipes with rice',
    },
    {
        label: 'Pasta',
        icon: IconPasta,
        description: 'Recipes with pasta',
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
    {
        label: 'Snacks',
        icon: PiBowlFoodFill,
        description: 'Quick snacks',
    },
    {
        label: 'Unsalted',
        icon: UnsaltedIcon,
        description: 'Recipes without salt',
    },
    {
        label: 'Gluten-Free',
        icon: GlutenFreeIcon,
        description: 'Gluten-free recipes',
    },
    {
        label: 'Vegan',
        icon: LuVegan,
        description: 'Vegan recipes',
    },
    {
        label: 'Breakfast',
        icon: IconBreakfast,
        description: 'Breakfast recipes',
    },
    {
        label: 'Award-Winning',
        icon: GiTrophyCup,
        description: 'Award-winning recipes',
    },
];

const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category');
    const pathname = usePathname();
    const isMainPage = pathname === '/';
    const isFavoritesPage = pathname === '/favorites';
    const isFilterablePage = isMainPage || isFavoritesPage;

    if (!isFilterablePage) {
        return null;
    }

    return (
        <Container>
            <div className="flex flex-row items-center justify-between overflow-x-auto pt-4">
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
};

export default Categories;

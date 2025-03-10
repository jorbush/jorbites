'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Container from '@/app/components/Container';
import CategoryBox from '@/app/components/CategoryBox';
import {
    GiLindenLeaf,
    GiAvocado,
    GiCakeSlice,
    GiPizzaSlice,
    GiCoffeeCup,
    GiMeat,
    GiBowlOfRice,
    GiWheat,
    GiTrophyCup,
} from 'react-icons/gi';
import { FaFish, FaBan } from 'react-icons/fa';
import { TbSoup, TbSalad, TbSalt } from 'react-icons/tb';
import { PiBowlFoodFill } from 'react-icons/pi';
import { LuVegan } from 'react-icons/lu';

const BannedIcon = ({
    Icon,
    size,
}: {
    Icon: React.ElementType;
    size: number;
}) => (
    <div className="relative">
        <Icon size={size} />
        <div className="absolute inset-0 -translate-x-2 -translate-y-2 opacity-50">
            <FaBan size={size + 15} />
        </div>
    </div>
);

const UnsaltedIcon = (props: any) => (
    <BannedIcon
        Icon={TbSalt}
        size={props.size}
    />
);

const GlutenFreeIcon = (props: any) => (
    <BannedIcon
        Icon={GiWheat}
        size={props.size}
    />
);

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

    if (!isMainPage) {
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

import React from 'react';
import { IoMdSunny, IoMdMoon } from 'react-icons/io';
import { IoRestaurantOutline } from 'react-icons/io5';
import { BiCookie } from 'react-icons/bi';

export const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
        case 'breakfast':
            return (
                <IoMdSunny
                    size={20}
                    className="text-amber-500"
                />
            );
        case 'lunch':
            return (
                <IoRestaurantOutline
                    size={20}
                    className="text-emerald-500"
                />
            );
        case 'dinner':
            return (
                <IoMdMoon
                    size={20}
                    className="text-indigo-500"
                />
            );
        case 'snack':
            return (
                <BiCookie
                    size={20}
                    className="text-rose-500"
                />
            );
        default:
            return null;
    }
};

export const getMealHeaderClass = (mealType: string) => {
    switch (mealType.toLowerCase()) {
        case 'breakfast':
            return 'bg-amber-50/50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300';
        case 'lunch':
            return 'bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300';
        case 'dinner':
            return 'bg-indigo-50/50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-300';
        case 'snack':
            return 'bg-rose-50/50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300';
        default:
            return 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700';
    }
};

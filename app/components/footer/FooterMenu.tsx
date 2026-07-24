'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
    FcPositiveDynamic,
    FcAbout,
    FcConferenceCall,
    FcManager,
    FcNews,
    FcDiploma1,
    FcSimCard,
} from 'react-icons/fc';

interface FooterMenuItem {
    href: string;
    label: string;
    icon: React.ComponentType<any>;
}

const MENU_ITEMS: FooterMenuItem[] = [
    {
        href: '/bite-cards',
        label: 'bite_cards_title',
        icon: FcSimCard,
    },
    {
        href: '/top-jorbiters',
        label: 'top_jorbiters',
        icon: FcPositiveDynamic,
    },
    {
        href: '/chefs',
        label: 'chefs',
        icon: FcManager,
    },
    {
        href: '/workshops',
        label: 'workshops',
        icon: FcConferenceCall,
    },
    {
        href: '/blog',
        label: 'blog',
        icon: FcNews,
    },
    {
        href: '/courses',
        label: 'courses',
        icon: FcDiploma1,
    },
    {
        href: '/about',
        label: 'about',
        icon: FcAbout,
    },
];

const FooterMenu = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap justify-center gap-4">
            {MENU_ITEMS.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-x-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                    prefetch={false}
                >
                    <item.icon className="size-4" />
                    <span>{t(item.label)}</span>
                </Link>
            ))}
        </div>
    );
};

export default FooterMenu;

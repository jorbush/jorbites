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
} from 'react-icons/fc';

interface FooterMenuItem {
    href: string;
    labelKey: string;
    icon: React.ComponentType<any>;
}

const MENU_ITEMS: FooterMenuItem[] = [
    {
        href: '/top-jorbiters',
        labelKey: 'top_jorbiters',
        icon: FcPositiveDynamic,
    },
    {
        href: '/chefs',
        labelKey: 'chefs',
        icon: FcManager,
    },
    {
        href: '/workshops',
        labelKey: 'workshops',
        icon: FcConferenceCall,
    },
    {
        href: '/blog',
        labelKey: 'blog',
        icon: FcNews,
    },
    {
        href: '/certificates',
        labelKey: 'certificates',
        icon: FcDiploma1,
    },
    {
        href: '/about',
        labelKey: 'about',
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
                    <span>{t(item.labelKey)}</span>
                </Link>
            ))}
        </div>
    );
};

export default FooterMenu;

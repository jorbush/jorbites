'use client';

import { useTranslation } from 'react-i18next';
import useTheme from '@/app/hooks/useTheme';
import Link from 'next/link';
import Image from 'next/image';
import packageJson from '@/package.json';
import { FaGithub, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { RiGitRepositoryLine } from 'react-icons/ri';
import FooterMenu from './FooterMenu';
import { CONTACT_EMAIL } from '@/app/constants';

const Footer = () => {
    useTheme();
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            icon: FaEnvelope,
            href: `mailto:${CONTACT_EMAIL}`,
            label: 'Email',
        },
        {
            icon: RiGitRepositoryLine,
            href: 'https://github.com/jorbush/jorbites',
            label: 'Repository',
        },
        {
            icon: FaGithub,
            href: 'https://github.com/jorbush',
            label: 'GitHub',
        },
        {
            icon: FaInstagram,
            href: 'https://instagram.com/jorbites',
            label: 'Instagram',
        },
        {
            icon: FaTwitter,
            href: 'https://x.com/jorbitesapp',
            label: 'Twitter',
        },
    ];

    return (
        <footer
            className="dark:bg-dark w-full border-t border-neutral-200 bg-white px-4 py-8 dark:border-neutral-800"
            data-testid="footer"
        >
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center space-y-6">
                    <FooterMenu />
                    <a
                        href={`https://github.com/jorbush/jorbites/releases/tag/v${packageJson.version}`}
                        className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {`${t('version')} ${packageJson.version}`}
                    </a>
                    <div className="flex space-x-6">
                        {socialLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-neutral-500 transition-all duration-200 hover:-translate-y-1 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-300"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                            >
                                <link.icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>
                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link
                            href="/policies/privacy"
                            className="text-neutral-500 transition-colors duration-200 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-300"
                            prefetch={false}
                        >
                            {t('privacy_policy')}
                        </Link>
                        <Link
                            href="/policies/cookies"
                            className="text-neutral-500 transition-colors duration-200 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-300"
                            prefetch={false}
                        >
                            {t('cookies_policy')}
                        </Link>
                    </nav>
                    <Link
                        href="/"
                        className="group flex items-center space-x-2 opacity-80 transition-opacity hover:opacity-100"
                    >
                        <Image
                            src="/avocado.webp"
                            alt="Jorbites Logo"
                            width={24}
                            height={24}
                            className="transition-transform group-hover:scale-110"
                        />
                        <span className="text-base text-neutral-600 dark:text-neutral-400">
                            Jorbites
                        </span>
                    </Link>
                    <div className="text-sm text-neutral-500 dark:text-gray-400">
                        © {currentYear} Jorbites. {t('rights_reserved')}.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import Link from 'next/link';
import Image from 'next/image';
import packageJson from '@/package.json';
import { FaGithub, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { RiGitRepositoryLine } from 'react-icons/ri';

export default function SmartFooter() {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            icon: FaEnvelope,
            href: 'mailto:jbonetv5@gmail.com',
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
                    <Link
                        href="/"
                        className="hover:opacity-80"
                    >
                        <Image
                            src="/android-chrome-192x192.png"
                            alt="Jorbites"
                            width={48}
                            height={48}
                            className="h-12 w-12"
                        />
                    </Link>

                    <div className="flex space-x-6">
                        {socialLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                                    aria-label={link.label}
                                >
                                    <Icon size={20} />
                                </a>
                            );
                        })}
                    </div>

                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link
                            href="/about"
                            className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        >
                            Sobre Jorbites
                        </Link>
                        <Link
                            href="/policies/privacy"
                            className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        >
                            Política de Privacidad
                        </Link>
                        <Link
                            href="/policies/cookies"
                            className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        >
                            Política de Cookies
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>v{packageJson.version}</span>
                        <span>•</span>
                        <span>Made with ❤️ by Jordi</span>
                    </div>

                    <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                        &copy; {currentYear} Jorbites. Todos los derechos
                        reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}

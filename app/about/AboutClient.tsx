'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaEnvelope, FaHeart } from 'react-icons/fa';
import { RiGitRepositoryLine } from 'react-icons/ri';
import useRegisterModal from '@/app/hooks/useRegisterModal';

interface AboutClientProps {
    currentUser?: SafeUser | null;
}

const AboutClient: React.FC<AboutClientProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const registerModal = useRegisterModal();

    return (
        <Container>
            <div className="mx-auto max-w-4xl">
                <div className="py-8">
                    <Heading
                        title={t('about') || 'About'}
                        subtitle={
                            t('about_subtitle') ||
                            'Learn more about Jorbites and our mission'
                        }
                        center
                    />
                </div>

                <div className="space-y-8">
                    {/* What is Jorbites Section */}
                    <section className="rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('what_is_jorbites')}
                        </h2>
                        <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                            {t('jorbites_description')}
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            {t('jorbites_mission')}
                        </p>
                    </section>

                    {/* Why Jorbites Section */}
                    <section className="rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('why_jorbites')}
                        </h2>
                        <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                            {t('why_jorbites_description')}
                        </p>
                        <Link
                            href="/recipes/68b194a84e84cb9eabfb4350"
                            className="text-green-450 dark:text-green-450 inline-flex items-center hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            prefetch={false}
                        >
                            🥑 {t('why_jorbites_recipe')}
                        </Link>
                    </section>

                    {/* Features Section */}
                    <section>
                        <h2 className="mb-6 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('features')}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('share_recipes')}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('share_recipes_description')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('discover_recipes')}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('discover_recipes_description')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('level_system')}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('level_system_description')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('community')}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {t('community_description')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Architecture Section */}
                    <section className="rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('architecture')}
                        </h2>
                        <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                            Jorbites follows a modern microservices architecture
                            for scalability and performance, overcoming
                            serverless limitations with specialized services.
                        </p>
                        <div className="space-y-3">
                            <div>
                                <h3 className="mb-2 font-semibold text-neutral-800 dark:text-neutral-200">
                                    Core Platform
                                </h3>
                                <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                    <li>Next.js with TypeScript on Vercel</li>
                                    <li>MongoDB Atlas with Prisma ORM</li>
                                    <li>NextAuth with Google/GitHub SSO</li>
                                    <li>Cloudinary image optimization</li>
                                    <li>Upstash Redis for rate limiting</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-neutral-800 dark:text-neutral-200">
                                    Microservices
                                </h3>
                                <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                    <li>
                                        <a
                                            href="https://github.com/jorbush/jorbites-notifier"
                                            className="text-green-450 dark:text-green-450 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Jorbites Notifier
                                        </a>{' '}
                                        (Go): Notification service with FIFO
                                        queue
                                    </li>
                                    <li>
                                        <a
                                            href="https://github.com/jorbush/badge_forge"
                                            className="text-green-450 dark:text-green-450 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Badge Forge
                                        </a>{' '}
                                        (Rust): Badge and level calculation
                                        system
                                    </li>
                                    <li>
                                        <a
                                            href="https://github.com/jorbush/pantry_keeper"
                                            className="text-green-450 dark:text-green-450 hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Pantry Keeper
                                        </a>{' '}
                                        (Python): Automated database backup
                                        system
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Documentation Section */}
                    <section>
                        <h2 className="mb-4 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('documentation')}
                        </h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            <a
                                href="https://github.com/jorbush/jorbites/blob/main/docs/development.md"
                                className="rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <h3 className="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">
                                    Development Setup
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Local development guide
                                </p>
                            </a>
                            <a
                                href="https://github.com/jorbush/jorbites/blob/main/docs/architecture.md"
                                className="rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <h3 className="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">
                                    Architecture Details
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Detailed system architecture
                                </p>
                            </a>
                            <a
                                href="https://github.com/jorbush/jorbites/blob/main/docs/api-error-handling.md"
                                className="rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <h3 className="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">
                                    API Documentation
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    API endpoints and error handling
                                </p>
                            </a>
                            <a
                                href="https://github.com/jorbush/jorbites/blob/main/docs/image_optimization.md"
                                className="rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <h3 className="mb-1 font-semibold text-neutral-800 dark:text-neutral-200">
                                    Image Optimization
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Image proxy and optimization
                                </p>
                            </a>
                        </div>
                    </section>

                    {/* The Project Section */}
                    <section className="rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('the_project')}
                        </h2>
                        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-6">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/avocado.webp"
                                    alt="Jorbites Logo"
                                    width={80}
                                    height={80}
                                    className="rounded-full"
                                />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                                    {t('developer_description')}
                                </p>
                                <div className="flex flex-col items-center space-y-3 md:items-start">
                                    <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                                        <a
                                            href="https://github.com/jorbush"
                                            className="flex items-center space-x-2 text-neutral-600 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FaGithub className="h-5 w-5" />
                                            <span>GitHub</span>
                                        </a>
                                        <a
                                            href="mailto:jbonetv5@gmail.com"
                                            className="flex items-center space-x-2 text-neutral-600 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                                        >
                                            <FaEnvelope className="h-5 w-5" />
                                            <span>{t('contact')}</span>
                                        </a>
                                        <a
                                            href="https://github.com/jorbush/jorbites"
                                            className="flex items-center space-x-2 text-neutral-600 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <RiGitRepositoryLine className="h-5 w-5" />
                                            <span>Repository</span>
                                        </a>
                                        <a
                                            href="https://github.com/sponsors/jorbush"
                                            className="inline-flex items-center space-x-2 rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FaHeart className="h-4 w-4" />
                                            <span>Sponsor on GitHub</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Get Started Section */}
                    <section className="text-center">
                        <h2 className="mb-4 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('get_started')}
                        </h2>
                        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                            {t('get_started_description')}
                        </p>
                        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/"
                                prefetch={false}
                                className="rounded-lg bg-neutral-800 px-6 py-3 text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
                            >
                                {t('explore_recipes')}
                            </Link>
                            {!currentUser && (
                                <button
                                    onClick={registerModal.onOpen}
                                    className="rounded-lg border border-neutral-300 px-6 py-3 text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                >
                                    {t('sign_up')}
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Container>
    );
};

export default AboutClient;

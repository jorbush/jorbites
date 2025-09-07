'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaEnvelope } from 'react-icons/fa';

interface AboutClientProps {
    currentUser?: SafeUser | null;
}

const AboutClient: React.FC<AboutClientProps> = ({ currentUser }) => {
    const { t } = useTranslation();

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

                    {/* Features Section */}
                    <section>
                        <h2 className="mb-6 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('features')}
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('share_recipes')}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t('share_recipes_description')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('discover_recipes')}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t('discover_recipes_description')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('level_system')}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t('level_system_description')}
                                </p>
                            </div>
                            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                                <h3 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                    {t('community')}
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t('community_description')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Developer Section */}
                    <section className="rounded-lg bg-neutral-50 p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                            {t('about_developer')}
                        </h2>
                        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/avocado.webp"
                                    alt="Jorbites Logo"
                                    width={80}
                                    height={80}
                                    className="rounded-full"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <p className="mb-3 text-neutral-600 dark:text-neutral-400">
                                    {t('developer_description')}
                                </p>
                                <div className="flex justify-center space-x-4 md:justify-start">
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
                                className="rounded-lg bg-neutral-800 px-6 py-3 text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
                            >
                                {t('explore_recipes')}
                            </Link>
                            {!currentUser && (
                                <Link
                                    href="/"
                                    className="rounded-lg border border-neutral-300 px-6 py-3 text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                >
                                    {t('sign_up')}
                                </Link>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Container>
    );
};

export default AboutClient;

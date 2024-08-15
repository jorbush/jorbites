'use client';

import Container from '@/app/components/Container';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';

const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <Container>
            <div className="mx-auto max-w-screen-md dark:text-neutral-100">
                <Head>
                    <title>{t('privacy_policy')} | Jorbites</title>
                    <meta
                        name="description"
                        content={t('privacy_policy_description') || ''}
                    />
                </Head>
                <div className="mx-auto max-w-[700px] gap-10 px-1 py-0 md:px-4 md:py-6">
                    <div className="mb-5 flex items-center justify-between">
                        <button
                            className="flex items-center space-x-2 text-gray-600 focus:outline-none dark:text-neutral-100"
                            onClick={() => router.back()}
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                        <h1 className="text-3xl font-bold">
                            {t('privacy_policy')}
                        </h1>
                        <div className="w-8"></div>
                    </div>
                    <p className="mb-4">
                        {t('last_update')}: {t('privacy_date')}
                    </p>
                    <p className="mb-4">
                        {t('privacy_intro_1')}
                        <strong>Jorbites</strong>
                        {t('privacy_intro_2')}
                        <a
                            href="https://jorbites.com"
                            className="text-blue-600"
                        >
                            jorbites.com
                        </a>
                        {t('privacy_intro_3')}
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('information_we_collect')}
                    </h2>
                    <p className="mb-4">{t('information_collect_intro')}</p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>{t('user_data')}:</strong>
                        </li>
                        <ul className="mb-4 ml-6 list-disc">
                            <li>
                                <strong>{t('identification_contact')}:</strong>{' '}
                                {t('identification_contact_desc')}
                            </li>
                            <li>
                                <strong>{t('authentication')}:</strong>{' '}
                                {t('authentication_desc')}
                            </li>
                            <li>
                                <strong>{t('preferences_settings')}:</strong>{' '}
                                {t('preferences_settings_desc')}
                            </li>
                        </ul>
                        <li>
                            <strong>{t('activity_data')}:</strong>
                        </li>
                        <ul className="mb-4 ml-6 list-disc">
                            <li>
                                <strong>{t('recipes')}:</strong>{' '}
                                {t('recipes_desc')}
                            </li>
                            <li>
                                <strong>{t('comments')}:</strong>{' '}
                                {t('comments_desc')}
                            </li>
                        </ul>
                        <li>
                            <strong>{t('images')}: </strong>
                            {t('images_desc_1')}
                            <a
                                href="https://cloudinary.com/"
                                className="text-blue-600"
                            >
                                Cloudinary
                            </a>
                            {t('images_desc_2')}
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('how_we_use_info')}
                    </h2>
                    <p className="mb-4">{t('use_info_intro')}</p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>{t('use_info_1')}</li>
                        <li>{t('use_info_2')}</li>
                        <li>{t('use_info_3')}</li>
                        <li>{t('use_info_4')}</li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('sharing_info')}
                    </h2>
                    <p className="mb-4">{t('sharing_info_intro')}</p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>{t('service_providers')}:</strong>
                            {t('service_providers_desc_1')}(
                            <a
                                href="https://vercel.com"
                                className="text-blue-600"
                            >
                                Vercel
                            </a>
                            ){t('service_providers_desc_2')}(
                            <a
                                href="https://www.godaddy.com"
                                className="text-blue-600"
                            >
                                GoDaddy
                            </a>
                            ){t('service_providers_desc_3')}(
                            <a
                                href="https://www.mongodb.com"
                                className="text-blue-600"
                            >
                                MongoDB
                            </a>
                            ){t('service_providers_desc_4')}
                            <a
                                href="https://cloudinary.com/"
                                className="text-blue-600"
                            >
                                Cloudinary
                            </a>{' '}
                            {t('service_providers_desc_5')}
                        </li>
                        <li>
                            <strong>{t('legal_requirements')}:</strong>{' '}
                            {t('legal_requirements_desc')}
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('data_security')}
                    </h2>
                    <p className="mb-4">{t('data_security_desc')}</p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('your_rights')}
                    </h2>
                    <p className="mb-4">{t('your_rights_intro')}</p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>{t('access')}:</strong> {t('access_desc')}
                        </li>
                        <li>
                            <strong>{t('rectification')}:</strong>{' '}
                            {t('rectification_desc')}
                        </li>
                        <li>
                            <strong>{t('deletion')}:</strong>{' '}
                            {t('deletion_desc')}
                        </li>
                        <li>
                            <strong>{t('opposition')}:</strong>{' '}
                            {t('opposition_desc')}
                        </li>
                    </ul>
                    <p className="mb-4">
                        {t('exercise_rights')}
                        <a
                            href="mailto:jbonetv5@gmail.com"
                            className="text-blue-600"
                        >
                            jbonetv5@gmail.com
                        </a>
                        .
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('data_retention')}
                    </h2>
                    <p className="mb-4">{t('data_retention_desc')}</p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('policy_changes')}
                    </h2>
                    <p className="mb-4">{t('policy_changes_desc')}</p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        8. {t('contact')}
                    </h2>
                    <p>
                        {t('contact_desc')}
                        <a
                            href="mailto:jbonetv5@gmail.com"
                            className="text-blue-600"
                        >
                            jbonetv5@gmail.com
                        </a>
                        .
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default PrivacyPolicy;

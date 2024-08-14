'use client';
import Container from '@/app/components/Container';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft } from 'react-icons/fi';

const CookiesPolicy: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <Container>
            <div className="mx-auto max-w-screen-md dark:text-neutral-100">
                <Head>
                    <title>{t('cookies_policy')} | Jorbites</title>
                    <meta
                        name="description"
                        content="Jorbites Cookies Policy"
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
                            {t('cookies_policy')}
                        </h1>
                        <div className="w-8"></div>
                    </div>
                    <p className="mb-4">
                        {t('last_update')}: [{t('cookies_date')}]
                    </p>
                    <p className="mb-4">
                        {t('cookies_description_1')} <strong>Jorbites</strong>
                        {t('cookies_description_2')}
                        <a
                            href="https://jorbites.com"
                            className="text-blue-600"
                        >
                            jorbites.com
                        </a>
                        {t('cookies_description_3')}
                    </p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('what_are_cookies')}
                    </h2>
                    <p className="mb-4">{t('cookies_definition')}</p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('types_of_cookies')}
                    </h2>
                    <h3 className="mb-2 mt-4 text-xl font-semibold">
                        {t('essential_technical_cookies')}
                    </h3>
                    <p className="mb-4">
                        {t('essential_technical_cookies_description')}
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <strong>{t('session_cookies_title')}</strong>{' '}
                            {t('session_cookies_description')}
                        </li>
                        <li>
                            <strong>{t('authentication_cookies_title')}</strong>{' '}
                            {t('authentication_cookies_description_1')}
                            <a
                                href="https://policies.google.com/privacy"
                                className="text-blue-600"
                            >
                                Google SSO
                            </a>{' '}
                            {t('authentication_cookies_description_2')}
                            <a
                                href="https://docs.github.com/en/github/authenticating-to-github/githubs-privacy-statement"
                                className="text-blue-600"
                            >
                                GitHub SSO
                            </a>
                            .
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('third_party_services')}
                    </h2>
                    <p className="mb-4">
                        {t('third_party_services_description_1')}
                        <a
                            href="https://vercel.com"
                            className="text-blue-600"
                        >
                            Vercel
                        </a>
                        {t('third_party_services_description_2')}
                        <a
                            href="https://www.godaddy.com"
                            className="text-blue-600"
                        >
                            GoDaddy
                        </a>
                        {t('third_party_services_description_3')}
                        <a
                            href="https://www.mongodb.com"
                            className="text-blue-600"
                        >
                            MongoDB
                        </a>{' '}
                        {t('third_party_services_description_4')}
                        <a
                            href="https://cloudinary.com/"
                            className="text-blue-600"
                        >
                            Cloudinary
                        </a>{' '}
                        {t('third_party_services_description_5')}
                    </p>
                    <ul className="mb-4 ml-6 list-disc">
                        <li>
                            <a
                                href="https://vercel.com/legal/privacy-policy"
                                className="text-blue-600"
                            >
                                {t('vercel_privacy_policy')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.godaddy.com/legal/agreements/privacy-policy"
                                className="text-blue-600"
                            >
                                {t('godaddy_privacy_policy')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.mongodb.com/legal/privacy-policy"
                                className="text-blue-600"
                            >
                                {t('mongodb_privacy_policy')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://cloudinary.com/privacy"
                                className="text-blue-600"
                            >
                                {t('cloudinary_privacy_policy')}
                            </a>
                        </li>
                    </ul>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('how_to_manage_cookies')}
                    </h2>
                    <p className="mb-4">{t('manage_cookies_description')}</p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('changes_in_cookies_policy')}
                    </h2>
                    <p className="mb-4">{t('policy_changes_description')}</p>
                    <h2 className="mb-2 mt-4 text-2xl font-semibold">
                        {t('contact')}
                    </h2>
                    <p>
                        {t('contact_description_1')}
                        <a
                            href="mailto:jbonetv5@gmail.com"
                            className="text-blue-600"
                        >
                            jbonetv5@gmail.com
                        </a>{' '}
                        {t('contact_description_2')}
                        <Link
                            href="/policies/privacy"
                            className="text-blue-600"
                        >
                            {t('privacy_policy')}
                        </Link>{' '}
                        {t('contact_description_3')}
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default CookiesPolicy;

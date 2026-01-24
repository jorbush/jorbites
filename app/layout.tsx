import '@/app/globals.css';
import { Nunito } from 'next/font/google';
import Navbar from '@/app/components/navbar/Navbar';
import ToasterProvider from '@/app/providers/ToasterProvider';
import I18nProvider from '@/app/providers/I18nProvider';
import getCurrentUser from '@/app/actions/getCurrentUser';
import SmartFooter from '@/app/components/footer/SmartFooter';
import { dynamicImport } from '@/app/utils/dynamicImport';
import { WebVitals } from '@/app/lib/axiom/client';

const RegisterModal = dynamicImport(
    () => import('@/app/components/modals/RegisterModal')
);
const LoginModal = dynamicImport(
    () => import('@/app/components/modals/LoginModal')
);
const RecipeModal = dynamicImport(
    () => import('@/app/components/modals/RecipeModal')
);
const WorkshopModal = dynamicImport(
    () => import('@/app/components/modals/WorkshopModal')
);
const SettingsModal = dynamicImport(
    () => import('@/app/components/modals/SettingsModal')
);
const PullToRefresh = dynamicImport(
    () => import('@/app/components/utils/PullToRefresh')
);
const ForgotPasswordModal = dynamicImport(
    () => import('@/app/components/modals/ForgotPasswordModal')
);
const QuestModal = dynamicImport(
    () => import('@/app/components/modals/QuestModal')
);

const SpeedInsights = dynamicImport<{}>(() =>
    import('@vercel/speed-insights/next').then((mod) => ({
        default: mod.SpeedInsights,
    }))
);

const font = Nunito({
    subsets: ['latin'],
    display: 'swap',
});

export const metadata = {
    metadataBase: new URL('https://jorbites.com'),
    title: 'Jorbites',
    description:
        'Descubre y comparte recetas deliciosas creadas por una comunidad de amantes de la cocina',
    keywords:
        'recetas, recipes, receptes, cocina, cooking, cuina, gastronomía, food, jorbites',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '48x48' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
            { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
            { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'Jorbites | Comparte tus mejores recetas',
        description:
            'Descubre y comparte recetas deliciosas creadas por una comunidad de amantes de la cocina',
        url: 'https://jorbites.com',
        siteName: 'Jorbites',
        images: [
            {
                url: '/jorbites-social.jpg',
                width: 1200,
                height: 630,
                alt: 'Jorbites - Comparte tus recetas',
            },
        ],
        type: 'website',
    },
    alternates: {
        canonical: 'https://jorbites.com',
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentUser = await getCurrentUser();

    return (
        <html
            lang="es"
            translate="no"
        >
            <WebVitals />
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content="Jorbites"
                />
            </head>
            <body
                className={`${font.className} dark:bg-dark flex min-h-screen flex-col`}
            >
                <I18nProvider />
                <ToasterProvider />
                <LoginModal />
                <SettingsModal currentUser={currentUser} />
                <RecipeModal currentUser={currentUser} />
                <WorkshopModal currentUser={currentUser} />
                <RegisterModal />
                <ForgotPasswordModal />
                <QuestModal />
                <Navbar currentUser={currentUser} />
                <PullToRefresh
                    threshold={150}
                    indicator={true}
                />
                <main
                    id="main-content"
                    className="grow pt-28 pb-20"
                >
                    {children}
                </main>
                <SmartFooter />
                {process.env.NODE_ENV === 'production' && <SpeedInsights />}
            </body>
        </html>
    );
}

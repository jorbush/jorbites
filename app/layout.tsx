import '@/app/globals.css';
import { Nunito } from 'next/font/google';
import Navbar from '@/app/components/navbar/Navbar';
import ClientOnly from '@/app/components/utils/ClientOnly';
import ToasterProvider from '@/app/providers/ToasterProvider';
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
const AddToListModal = dynamicImport(
    () => import('@/app/components/modals/AddToListModal')
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

export const viewport = {
    themeColor: '#ffffff',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};

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
    appleWebApp: {
        capable: true,
        title: 'Jorbites',
        statusBarStyle: 'black-translucent',
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
            <head />
            <body
                className={`${font.className} dark:bg-dark flex min-h-screen flex-col`}
            >
                <ClientOnly>
                    <ToasterProvider />
                    <LoginModal />
                    <SettingsModal currentUser={currentUser} />
                    <RecipeModal currentUser={currentUser} />
                    <WorkshopModal currentUser={currentUser} />
                    <RegisterModal />
                    <ForgotPasswordModal />
                    <QuestModal />
                    <AddToListModal />
                    <Navbar currentUser={currentUser} />
                    <PullToRefresh
                        threshold={150}
                        indicator={true}
                    />
                </ClientOnly>
                <main
                    id="main-content"
                    className="grow pt-[calc(7rem+env(safe-area-inset-top,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"
                >
                    {children}
                </main>
                <SmartFooter />
                {process.env.NODE_ENV === 'production' && <SpeedInsights />}
            </body>
        </html>
    );
}

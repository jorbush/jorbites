import '@/app/globals.css';
import { Nunito } from 'next/font/google';
import Navbar from '@/app/components/navbar/Navbar';
import ClientOnly from '@/app/components/utils/ClientOnly';
import ToasterProvider from '@/app/providers/ToasterProvider';
import getCurrentUser from '@/app/actions/getCurrentUser';
import SmartFooter from '@/app/components/footer/SmartFooter';
import { dynamicImport } from '@/app/utils/dynamicImport';

// Dynamically import non-critical components
const RegisterModal = dynamicImport(
    () => import('@/app/components/modals/RegisterModal')
);
const LoginModal = dynamicImport(
    () => import('@/app/components/modals/LoginModal')
);
const RecipeModal = dynamicImport(
    () => import('@/app/components/modals/RecipeModal')
);
const SettingsModal = dynamicImport(
    () => import('@/app/components/modals/SettingsModal')
);

// Dynamically import analytics only in production
const SpeedInsights = dynamicImport<{}>(() =>
    import('@vercel/speed-insights/next').then((mod) => ({
        default: mod.SpeedInsights,
    }))
);
const Analytics = dynamicImport<{}>(() =>
    import('@vercel/analytics/next').then((mod) => ({ default: mod.Analytics }))
);

const font = Nunito({
    subsets: ['latin'],
    display: 'swap',
});

export const metadata = {
    title: 'Jorbites',
    description: 'a web to share recipes',
    icons: {
        icon: '/advocado.webp',
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
            lang="en"
            translate="no"
        >
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </head>
            <body
                className={`${font.className} flex min-h-screen flex-col dark:bg-dark`}
            >
                <ClientOnly>
                    <ToasterProvider />
                    <LoginModal />
                    <SettingsModal currentUser={currentUser} />
                    <RecipeModal currentUser={currentUser} />
                    <RegisterModal />
                    <Navbar currentUser={currentUser} />
                </ClientOnly>
                <main
                    id="main-content"
                    className="flex-grow pb-20 pt-28"
                >
                    {children}
                </main>
                <SmartFooter />
                {process.env.NODE_ENV === 'production' && (
                    <>
                        <SpeedInsights />
                        <Analytics />
                    </>
                )}
            </body>
        </html>
    );
}

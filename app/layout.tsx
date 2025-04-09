import '@/app/globals.css';
import { Nunito } from 'next/font/google';
import Navbar from '@/app/components/navbar/Navbar';
import ClientOnly from '@/app/components/utils/ClientOnly';
import ToasterProvider from '@/app/providers/ToasterProvider';
import getCurrentUser from '@/app/actions/getCurrentUser';
import SmartFooter from '@/app/components/footer/SmartFooter';
import { dynamicImport } from '@/app/utils/dynamicImport';

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
    title: 'Jorbites',
    description: 'a web to share recipes',
    icons: {
        icon: '/avocado.webp',
        shortcut: '/avocado.webp',
        apple: '/apple-icon.png',
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
                className={`${font.className} dark:bg-dark flex min-h-screen flex-col`}
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
                    className="grow pt-28 pb-20"
                >
                    {children}
                </main>
                <SmartFooter />
                {process.env.NODE_ENV === 'production' && (
                    <>
                        <SpeedInsights />
                    </>
                )}
            </body>
        </html>
    );
}

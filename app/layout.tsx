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
        apple: [
          { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
          { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
        ],
        other: [
          {
            rel: 'apple-touch-icon-precomposed',
            url: '/apple-touch-icon-precomposed.png',
          },
        ],
      },
      appleWebApp: {
        title: 'Jorbites',
        statusBarStyle: 'black-translucent',
        startupImage: [
          '/apple-splash-2048-2732.png',
          '/apple-splash-1668-2224.png',
          '/apple-splash-1536-2048.png',
          '/apple-splash-1125-2436.png',
          '/apple-splash-750-1334.png',
        ],
        capable: true,
      },
      themeColor: '#ffffff',
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
                <meta name="apple-mobile-web-app-title" content="Jorbites" />
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
                        <Analytics />
                    </>
                )}
            </body>
        </html>
    );
}

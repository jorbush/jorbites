import '@/app/globals.css';
import { Nunito } from 'next/font/google';
import Navbar from '@/app/components/navbar/Navbar';
import ClientOnly from '@/app/components/utils/ClientOnly';
import RegisterModal from '@/app/components/modals/RegisterModal';
import ToasterProvider from '@/app/providers/ToasterProvider';
import LoginModal from '@/app/components/modals/LoginModal';
import getCurrentUser from '@/app/actions/getCurrentUser';
import RecipeModal from '@/app/components/modals/RecipeModal';
import SettingsModal from '@/app/components/modals/SettingsModal';
import SmartFooter from '@/app/components/footer/SmartFooter';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

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
                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    );
}

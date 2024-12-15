import '@/app/globals.css';
import { Nunito } from 'next/font/google';
import Navbar from '@/app/components/navbar/Navbar';
import ClientOnly from '@/app/components/ClientOnly';
import RegisterModal from '@/app/components/modals/RegisterModal';
import ToasterProvider from '@/app/providers/ToasterProvider';
import LoginModal from '@/app/components/modals/LoginModal';
import getCurrentUser from '@/app/actions/getCurrentUser';
import RecipeModal from '@/app/components/modals/RecipeModal';
import SettingsModal from '@/app/components/modals/SettingsModal';
import Footer from '@/app/components/Footer';

const font = Nunito({ subsets: ['latin'] });

export const metadata = {
    title: 'Jorbites',
    description: 'a web to share recipes',
    icons: {
        icon: '/advocado.png',
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
            <body className={`${font.className} dark:bg-dark`}>
                <ClientOnly>
                    <ToasterProvider />
                    <LoginModal />
                    <SettingsModal currentUser={currentUser} />
                    <RecipeModal currentUser={currentUser} />
                    <RegisterModal />
                    <Navbar currentUser={currentUser} />
                </ClientOnly>
                <div className="pb-20 pt-28">{children}</div>
                <ClientOnly>
                    <Footer />
                </ClientOnly>
            </body>
        </html>
    );
}

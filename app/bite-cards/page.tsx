import ClientOnly from '@/app/components/utils/ClientOnly';
import Container from '@/app/components/utils/Container';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getBiteCards from '@/app/actions/getBiteCards';
import BiteCardsContainer from '@/app/components/recipes/BiteCardsContainer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Daily Bite Cards | Jorbites',
    description:
        'Quick mobile-first recipe discovery swiper. Swipe right to save recipes to your favorites!',
};

export const dynamic = 'force-dynamic';

export default async function BiteCardsPage() {
    const currentUser = await getCurrentUser();
    const safeRecipes = await getBiteCards({ limit: 20 }).catch(() => []);

    return (
        <ClientOnly>
            <main className="min-h-[calc(100vh-60px)] pb-2">
                <Container>
                    <BiteCardsContainer
                        initialRecipes={safeRecipes}
                        currentUser={currentUser}
                    />
                </Container>
            </main>
        </ClientOnly>
    );
}

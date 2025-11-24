import { Metadata } from 'next';
import ChefsClient from './ChefsClient';
import getChefs, { ChefOrderByType } from '@/app/actions/getChefs';
import ClientOnly from '@/app/components/utils/ClientOnly';
import Container from '@/app/components/utils/Container';
import ErrorDisplay from '@/app/components/utils/ErrorDisplay';

interface ChefsPageProps {
    searchParams: Promise<{
        search?: string;
        page?: string;
        orderBy?: string;
    }>;
}

export const metadata: Metadata = {
    title: 'Chefs | Jorbites',
    description:
        'Discover talented chefs and their culinary creations on Jorbites',
};

const ChefsPage = async ({ searchParams }: ChefsPageProps) => {
    const resolvedParams = await searchParams;
    const response = await getChefs({
        search: resolvedParams.search,
        page: resolvedParams.page ? parseInt(resolvedParams.page) : 1,
        orderBy: (resolvedParams.orderBy as ChefOrderByType) || undefined,
        limit: 12,
    });

    return (
        <ClientOnly
            fallback={
                <Container>
                    <div className="min-h-[60vh] py-8">
                        <div className="h-12 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[320px] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
                                />
                            ))}
                        </div>
                    </div>
                </Container>
            }
        >
            {response.error ? (
                <Container>
                    <div className="min-h-[60vh]">
                        <ErrorDisplay
                            code={response.error.code}
                            message={response.error.message}
                        />
                    </div>
                </Container>
            ) : (
                <ChefsClient
                    chefs={response.data?.chefs || []}
                    totalPages={response.data?.totalPages || 1}
                    currentPage={response.data?.currentPage || 1}
                />
            )}
        </ClientOnly>
    );
};

export default ChefsPage;

import { Metadata } from 'next';
import ChefsClient from './ChefsClient';
import getChefs, { ChefOrderByType } from '@/app/actions/getChefs';
import ClientOnly from '@/app/components/utils/ClientOnly';
import Container from '@/app/components/utils/Container';
import ErrorDisplay from '@/app/components/utils/ErrorDisplay';
import ChefsListSkeleton from '@/app/components/chefs/ChefsListSkeleton';

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
                    <div className="min-h-[60vh]">
                        <ChefsListSkeleton />
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

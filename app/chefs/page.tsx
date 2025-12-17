import { Metadata } from 'next';
import { Suspense } from 'react';
import ChefsClient from './ChefsClient';
import getChefs, { ChefOrderByType } from '@/app/actions/getChefs';
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

    if (response.error) {
        return (
            <Container>
                <div className="min-h-[60vh]">
                    <ErrorDisplay
                        code={response.error.code}
                        message={response.error.message}
                    />
                </div>
            </Container>
        );
    }

    return (
        <Suspense
            fallback={
                <Container>
                    <div className="min-h-[60vh]">
                        <ChefsListSkeleton />
                    </div>
                </Container>
            }
        >
            <ChefsClient
                chefs={response.data?.chefs || []}
                totalPages={response.data?.totalPages || 1}
                currentPage={response.data?.currentPage || 1}
            />
        </Suspense>
    );
};

export default ChefsPage;

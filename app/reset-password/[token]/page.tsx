import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import ResetPasswordClient from './ResetPasswordClient';
import EmptyState from '@/app/components/utils/EmptyState';

interface IParams {
    token?: string;
}

export const metadata: Metadata = {
    title: 'Reset Password',
};

export const dynamic = 'force-dynamic';

const ResetPasswordPage = async (props: { params: Promise<IParams> }) => {
    const { token } = await props.params;
    if (!token) {
        return (
            <ClientOnly>
                <EmptyState />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <ResetPasswordClient token={token} />
        </ClientOnly>
    );
};

export default ResetPasswordPage;

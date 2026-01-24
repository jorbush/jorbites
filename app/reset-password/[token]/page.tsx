import { Metadata } from 'next';
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
        return <EmptyState />;
    }

    return <ResetPasswordClient token={token} />;
};

export default ResetPasswordPage;

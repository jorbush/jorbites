import { Metadata } from 'next';
import { Suspense } from 'react';
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
            <Suspense fallback={<div className="min-h-[60vh]" />}>
                <EmptyState />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<div className="min-h-[60vh]" />}>
            <ResetPasswordClient token={token} />
        </Suspense>
    );
};

export default ResetPasswordPage;

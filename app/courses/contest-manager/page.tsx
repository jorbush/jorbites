import getCurrentUser from '@/app/actions/getCurrentUser';
import ContestManagerClient from './ContestManagerClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contest Manager Course | Jorbites',
    description: 'Learn how to organize cooking contests and earn your badge.',
};

const ContestManagerPage = async () => {
    const currentUser = await getCurrentUser();

    return <ContestManagerClient currentUser={currentUser} />;
};

export default ContestManagerPage;

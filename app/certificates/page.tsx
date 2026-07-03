import getCurrentUser from '@/app/actions/getCurrentUser';
import CertificatesClient from './CertificatesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Certificates | Jorbites',
    description: 'Enhance your cooking event hosting skills and get certified.',
};

const CertificatesPage = async () => {
    const currentUser = await getCurrentUser();

    return <CertificatesClient currentUser={currentUser} />;
};

export default CertificatesPage;

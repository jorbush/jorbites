import ClientOnly from '@/app/components/ClientOnly';
import PrivacyPolicy from '@/app/policies/privacy/privacy';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <ClientOnly>
            <PrivacyPolicy />
        </ClientOnly>
    );
};

export default PrivacyPolicyPage;

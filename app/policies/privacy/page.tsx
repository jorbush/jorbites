import ClientOnly from '@/app/components/utils/ClientOnly';
import PrivacyPolicy from '@/app/policies/privacy/privacy';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <ClientOnly>
            <PrivacyPolicy />
        </ClientOnly>
    );
};

export default PrivacyPolicyPage;

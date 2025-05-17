import ClientOnly from '@/app/components/utils/ClientOnly';
import PrivacyPolicy from '@/app/policies/privacy/privacy';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <ClientOnly fallback={<PolicySkeleton />}>
            <PrivacyPolicy />
        </ClientOnly>
    );
};

export default PrivacyPolicyPage;

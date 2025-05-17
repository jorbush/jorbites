import ClientOnly from '@/app/components/utils/ClientOnly';
import CookiesPolicy from '@/app/policies/cookies/cookies';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';

const CookiesPolicyPage: React.FC = () => {
    return (
        <ClientOnly fallback={<PolicySkeleton />}>
            <CookiesPolicy />
        </ClientOnly>
    );
};

export default CookiesPolicyPage;

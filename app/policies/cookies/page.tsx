import CookiesPolicy from '@/app/policies/cookies/cookies';
import { getPolicyBySlug } from '@/app/utils/policy-utils';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';

const CookiesPolicyPage = async () => {
    const policy = await getPolicyBySlug('cookies');

    if (!policy) {
        return <PolicySkeleton />;
    }

    return <CookiesPolicy policy={policy} />;
};

export default CookiesPolicyPage;

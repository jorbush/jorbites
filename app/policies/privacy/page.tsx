import PrivacyPolicy from '@/app/policies/privacy/privacy';
import { getPolicyBySlug } from '@/app/utils/policy-utils';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';

const PrivacyPolicyPage = async () => {
    const policy = await getPolicyBySlug('privacy');

    if (!policy) {
        return <PolicySkeleton />;
    }

    return <PrivacyPolicy policy={policy} />;
};

export default PrivacyPolicyPage;

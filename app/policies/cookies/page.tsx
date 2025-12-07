import CookiesPolicy from '@/app/policies/cookies/cookies';
import { getPolicyBySlug } from '@/app/utils/policy-utils';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';
import { cookies } from 'next/headers';

const CookiesPolicyPage = async () => {
    const cookieStore = await cookies();
    const lang = cookieStore.get('i18next')?.value || 'en';
    const policy = await getPolicyBySlug('cookies', lang);

    if (!policy) {
        return <PolicySkeleton />;
    }

    return <CookiesPolicy policy={policy} />;
};

export default CookiesPolicyPage;

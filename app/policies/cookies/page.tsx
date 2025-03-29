import ClientOnly from '@/app/components/utils/ClientOnly';
import CookiesPolicy from '@/app/policies/cookies/cookies';

const CookiesPolicyPage: React.FC = () => {
    return (
        <ClientOnly>
            <CookiesPolicy />
        </ClientOnly>
    );
};

export default CookiesPolicyPage;

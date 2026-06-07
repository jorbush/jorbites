'use client';
import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';
import { Policy } from '@/app/utils/policy-utils';
import ReactMarkdown from 'react-markdown';
import { PolicyStyles } from '@/app/components/policies/PolicyStyles';

interface CookiesPolicyProps {
    policy: Policy;
}

const CookiesPolicy: React.FC<CookiesPolicyProps> = ({ policy }) => {
    const { back } = useRouter() || {};

    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-md) dark:text-neutral-100">
                <div className="mx-auto max-w-[700px] gap-10 px-1 py-0 md:px-4 md:py-6">
                    <div className="mb-5 flex items-center justify-between">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-neutral-600 focus:outline-hidden dark:text-neutral-100"
                            onClick={() => back()}
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                        <h1 className="text-3xl font-semibold">
                            {policy.frontmatter.title}
                        </h1>
                        <div className="w-8"></div>
                    </div>
                    <ReactMarkdown components={PolicyStyles}>
                        {policy.content}
                    </ReactMarkdown>
                </div>
            </div>
        </Container>
    );
};

export default CookiesPolicy;

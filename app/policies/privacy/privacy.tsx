'use client';

import Container from '@/app/components/utils/Container';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';
import { Policy } from '@/app/utils/policy-utils';
import Markdown from 'markdown-to-jsx';

interface PrivacyPolicyProps {
    policy: Policy;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ policy }) => {
    const router = useRouter();

    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-md) dark:text-neutral-100">
                <Head>
                    <title>{policy.frontmatter.title} | Jorbites</title>
                    <meta
                        name="description"
                        content={policy.frontmatter.description}
                    />
                </Head>
                <div className="mx-auto max-w-[700px] gap-10 px-1 py-0 md:px-4 md:py-6">
                    <div className="mb-5 flex items-center justify-between">
                        <button
                            className="flex items-center space-x-2 text-gray-600 focus:outline-hidden dark:text-neutral-100"
                            onClick={() => router.back()}
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                        <h1 className="text-3xl font-bold">
                            {policy.frontmatter.title}
                        </h1>
                        <div className="w-8"></div>
                    </div>
                    <Markdown>{policy.content}</Markdown>
                </div>
            </div>
        </Container>
    );
};

export default PrivacyPolicy;

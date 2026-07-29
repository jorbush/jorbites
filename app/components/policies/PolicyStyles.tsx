import { Components } from 'react-markdown';

export const PolicyStyles: Components = {
    h2: ({ node: _node, children, ...props }) => (
        <h2
            className="mt-6 mb-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-100"
            {...props}
        >
            {children}
        </h2>
    ),
    h3: ({ node: _node, children, ...props }) => (
        <h3
            className="mt-5 mb-2 text-xl font-semibold text-neutral-800 dark:text-neutral-200"
            {...props}
        >
            {children}
        </h3>
    ),
    p: ({ node: _node, children, ...props }) => (
        <p
            className="mb-4 leading-relaxed"
            {...props}
        >
            {children}
        </p>
    ),
    a: ({ node: _node, children, href, ...props }) => (
        <a
            className="text-green-450 font-medium transition-colors hover:underline"
            href={href}
            {...(href?.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            {...props}
        >
            {children}
        </a>
    ),
    ul: ({ node: _node, ...props }) => (
        <ul
            className="mb-4 ml-6 list-disc space-y-1"
            {...props}
        />
    ),
    li: ({ node: _node, ...props }) => (
        <li
            className="mb-1.5 leading-relaxed"
            {...props}
        />
    ),
    code: ({ node: _node, children, ...props }) => (
        <code
            className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
            {...props}
        >
            {children}
        </code>
    ),
};

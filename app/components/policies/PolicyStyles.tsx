import { Components } from 'react-markdown';

export const PolicyStyles: Components = {
    h2: ({ node: _node, ...props }) => (
        <h2
            className="mt-4 mb-2 text-2xl font-semibold"
            {...props}
        />
    ),
    h3: ({ node: _node, ...props }) => (
        <h3
            className="mt-4 mb-2 text-xl font-semibold"
            {...props}
        />
    ),
    p: ({ node: _node, ...props }) => (
        <p
            className="mb-4"
            {...props}
        />
    ),
    a: ({ node: _node, ...props }) => (
        <a
            className="text-blue-600 hover:underline"
            {...props}
        />
    ),
    ul: ({ node: _node, ...props }) => (
        <ul
            className="mb-4 ml-6 list-disc"
            {...props}
        />
    ),
    li: ({ node: _node, ...props }) => (
        <li
            className="mb-2"
            {...props}
        />
    ),
};

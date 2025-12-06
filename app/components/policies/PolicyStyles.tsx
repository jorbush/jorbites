import React from 'react';

export const PolicyStyles = {
    h2: ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-2xl font-semibold mt-4 mb-2">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
    ),
    p: ({ children }: { children: React.ReactNode }) => (
        <p className="mb-4">{children}</p>
    ),
    a: ({
        children,
        ...props
    }: {
        children: React.ReactNode;
        [key: string]: any;
    }) => (
        <a
            {...props}
            className="text-blue-600 hover:underline"
        >
            {children}
        </a>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
        <ul className="list-disc ml-6 mb-4">{children}</ul>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
        <li className="mb-2">{children}</li>
    ),
};

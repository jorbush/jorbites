import { Components } from 'react-markdown';
import React from 'react';

// Helper function to detect and parse Markdown table string inside a paragraph
function renderMarkdownTableContent(content: string) {
    const lines = content
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    if (lines.length < 2) return null;

    // Check if lines are pipe-delimited table rows
    const isTable = lines.every(
        (line) => line.startsWith('|') && line.endsWith('|')
    );
    if (!isTable) return null;

    const parseRow = (row: string) =>
        row
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.trim());

    const headerCells = parseRow(lines[0]);
    // Skip divider line (line index 1 if it's :--- | ---)
    const dataLines = lines
        .slice(1)
        .filter((line) => !line.match(/^\|[\s:|-]+\|$/));

    return (
        <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 shadow-xs dark:border-neutral-700">
            <table className="w-full text-left text-sm text-neutral-700 dark:text-neutral-300">
                <thead className="bg-neutral-100 text-xs font-semibold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-200">
                    <tr>
                        {headerCells.map((cell, idx) => (
                            <th
                                key={`th-${cell}-${idx}`}
                                className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700"
                            >
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {dataLines.map((line, rIdx) => {
                        const rowCells = parseRow(line);
                        const rowKey = `tr-${rIdx}-${line.slice(0, 15)}`;
                        return (
                            <tr
                                key={rowKey}
                                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                            >
                                {rowCells.map((cell, cIdx) => (
                                    <td
                                        key={`${rowKey}-td-${cIdx}`}
                                        className="px-4 py-3"
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

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
    p: ({ node: _node, children, ...props }) => {
        if (typeof children === 'string' && children.trim().startsWith('|')) {
            const table = renderMarkdownTableContent(children);
            if (table) return table;
        }
        if (
            Array.isArray(children) &&
            children.length === 1 &&
            typeof children[0] === 'string'
        ) {
            const str = children[0];
            if (str.trim().startsWith('|')) {
                const table = renderMarkdownTableContent(str);
                if (table) return table;
            }
        }
        return (
            <p
                className="mb-4 leading-relaxed"
                {...props}
            >
                {children}
            </p>
        );
    },
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
            className="mb-1"
            {...props}
        />
    ),
    table: ({ node: _node, ...props }) => (
        <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 shadow-xs dark:border-neutral-700">
            <table
                className="w-full text-left text-sm text-neutral-700 dark:text-neutral-300"
                {...props}
            />
        </div>
    ),
    thead: ({ node: _node, ...props }) => (
        <thead
            className="bg-neutral-100 text-xs font-semibold text-neutral-700 uppercase dark:bg-neutral-800 dark:text-neutral-200"
            {...props}
        />
    ),
    tbody: ({ node: _node, ...props }) => (
        <tbody
            className="divide-y divide-neutral-200 dark:divide-neutral-700"
            {...props}
        />
    ),
    tr: ({ node: _node, ...props }) => (
        <tr
            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            {...props}
        />
    ),
    th: ({ node: _node, ...props }) => (
        <th
            className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700"
            {...props}
        />
    ),
    td: ({ node: _node, ...props }) => (
        <td
            className="px-4 py-3"
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

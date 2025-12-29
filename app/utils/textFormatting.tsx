import React from 'react';

/**
 * Formats text by detecting and rendering links, bold and italic formatting
 * Supports:
 * - URLs: automatically converts to clickable links
 * - Bold: text between ** or __ markers
 * - Italic: text between * or _ markers
 */
export const formatText = (
    text: string,
    linkClassName = 'text-green-450 hover:underline'
) => {
    const segments: React.ReactNode[] = [];
    let remainingText = text;
    const patterns = [
        {
            regex: /(https?:\/\/[^\s]+)/g,
            render: (match: string, ..._args: string[]) => (
                <a
                    href={match}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClassName} inline-block max-w-full break-all`}
                >
                    {match}
                </a>
            ),
        },
        {
            regex: /@([^[\]]+)\[([^\]]+)\]/g,
            render: (_match: string, ...args: string[]) => {
                const [username, userId] = args;
                return (
                    <a
                        href={`/profile/${userId}`}
                        className="text-green-450 cursor-pointer hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/profile/${userId}`;
                        }}
                    >
                        @{username}
                    </a>
                );
            },
        },
        {
            regex: /\*\*(.*?)\*\*/g,
            render: (_match: string, ...args: string[]) => (
                <strong>{args[0]}</strong>
            ),
        },
        {
            regex: /__(.*?)__/g,
            render: (_match: string, ...args: string[]) => (
                <strong>{args[0]}</strong>
            ),
        },
        {
            regex: /\*(.*?)\*/g,
            render: (_match: string, ...args: string[]) => <em>{args[0]}</em>,
        },
        {
            regex: /_(.*?)_/g,
            render: (_match: string, ...args: string[]) => <em>{args[0]}</em>,
        },
    ];
    type PatternType = (typeof patterns)[number];

    const findNextPattern = () => {
        let earliest: {
            index: number;
            pattern: PatternType | null;
            match: RegExpExecArray | null;
        } = {
            index: remainingText.length,
            pattern: null,
            match: null,
        };

        for (const pattern of patterns) {
            pattern.regex.lastIndex = 0; // Reset regex index
            const match = pattern.regex.exec(remainingText);
            if (match && match.index < earliest.index) {
                earliest = {
                    index: match.index,
                    pattern,
                    match,
                };
            }
        }

        return earliest;
    };

    // Process text by finding and replacing patterns sequentially
    while (remainingText.length > 0) {
        const { index, pattern, match } = findNextPattern();
        if (pattern && match) {
            if (index > 0) {
                segments.push(remainingText.substring(0, index));
            }
            segments.push(pattern.render(match[0], ...match.slice(1)));
            remainingText = remainingText.substring(index + match[0].length);
        } else {
            segments.push(remainingText);
            break;
        }
    }
    return (
        <React.Fragment>
            {segments.map((segment, index) => (
                <React.Fragment key={index}>{segment}</React.Fragment>
            ))}
        </React.Fragment>
    );
};

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
            render: (match: string) => (
                <a
                    href={match}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                >
                    {match}
                </a>
            ),
        },
        {
            regex: /\*\*(.*?)\*\*/g,
            render: (_match: string, content: string) => (
                <strong>{content}</strong>
            ),
        },
        {
            regex: /__(.*?)__/g,
            render: (_match: string, content: string) => (
                <strong>{content}</strong>
            ),
        },
        {
            regex: /\*(.*?)\*/g,
            render: (_match: string, content: string) => <em>{content}</em>,
        },
        {
            regex: /_(.*?)_/g,
            render: (_match: string, content: string) => <em>{content}</em>,
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
            // Add any plain text before the pattern
            if (index > 0) {
                segments.push(remainingText.substring(0, index));
            }
            // Render the matched pattern differently based on type
            if (pattern.regex.source.includes('https?')) {
                segments.push(pattern.render(match[0], ''));
            } else {
                segments.push(pattern.render(match[0], match[1]));
            }
            // Continue with remaining text after this match
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

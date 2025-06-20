/**
 * Utility functions for handling user mentions in comments
 */

/**
 * Extracts mentioned user IDs from comment text
 * @param comment The comment text containing mentions in format @username[userId]
 * @returns Array of user IDs that were mentioned
 */
export const extractMentionedUserIds = (comment: string): string[] => {
    const mentionRegex = /@[^[\]]+\[([^\]]+)\]/g;
    const userIds: string[] = [];
    let match;

    while ((match = mentionRegex.exec(comment)) !== null) {
        const userId = match[1];
        if (userId && !userIds.includes(userId)) {
            userIds.push(userId);
        }
    }

    return userIds;
};

/**
 * Gets user names from mentions in comment text
 * @param comment The comment text containing mentions in format @username[userId]
 * @returns Array of usernames that were mentioned
 */
export const extractMentionedUsernames = (comment: string): string[] => {
    const mentionRegex = /@([^[\]]+)\[[^\]]+\]/g;
    const usernames: string[] = [];
    let match;

    while ((match = mentionRegex.exec(comment)) !== null) {
        const username = match[1];
        if (username && !usernames.includes(username)) {
            usernames.push(username);
        }
    }

    return usernames;
};

/**
 * Cleans mentions for display by removing the user ID part
 * @param comment The comment text containing mentions in format @username[userId]
 * @returns Comment text with mentions in format @username
 */
export const cleanMentionsForDisplay = (comment: string): string => {
    return comment.replace(/@([^[\]]+)\[[^\]]+\]/g, '@$1');
};

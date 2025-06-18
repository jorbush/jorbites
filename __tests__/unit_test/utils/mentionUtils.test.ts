import { describe, it, expect } from 'vitest';
import {
    extractMentionedUserIds,
    extractMentionedUsernames,
    cleanMentionsForDisplay,
} from '@/app/utils/mentionUtils';

describe('mentionUtils', () => {
    describe('extractMentionedUserIds', () => {
        it('extracts single user ID from mention', () => {
            const comment = 'Hello @John Doe[user123] how are you?';
            const result = extractMentionedUserIds(comment);
            expect(result).toEqual(['user123']);
        });

        it('extracts multiple user IDs from mentions', () => {
            const comment =
                'Hello @John Doe[user123] and @Jane Smith[user456], how are you?';
            const result = extractMentionedUserIds(comment);
            expect(result).toEqual(['user123', 'user456']);
        });

        it('removes duplicate user IDs', () => {
            const comment =
                'Hello @John Doe[user123] and @John[user123] again!';
            const result = extractMentionedUserIds(comment);
            expect(result).toEqual(['user123']);
        });

        it('returns empty array when no mentions found', () => {
            const comment = 'Hello everyone!';
            const result = extractMentionedUserIds(comment);
            expect(result).toEqual([]);
        });

        it('handles mentions with spaces in usernames', () => {
            const comment = 'Hey @Mary Jane Watson[user789]!';
            const result = extractMentionedUserIds(comment);
            expect(result).toEqual(['user789']);
        });
    });

    describe('extractMentionedUsernames', () => {
        it('extracts single username from mention', () => {
            const comment = 'Hello @John Doe[user123] how are you?';
            const result = extractMentionedUsernames(comment);
            expect(result).toEqual(['John Doe']);
        });

        it('extracts multiple usernames from mentions', () => {
            const comment =
                'Hello @John Doe[user123] and @Jane Smith[user456], how are you?';
            const result = extractMentionedUsernames(comment);
            expect(result).toEqual(['John Doe', 'Jane Smith']);
        });

        it('removes duplicate usernames', () => {
            const comment =
                'Hello @John Doe[user123] and @John Doe[user123] again!';
            const result = extractMentionedUsernames(comment);
            expect(result).toEqual(['John Doe']);
        });

        it('returns empty array when no mentions found', () => {
            const comment = 'Hello everyone!';
            const result = extractMentionedUsernames(comment);
            expect(result).toEqual([]);
        });
    });

    describe('cleanMentionsForDisplay', () => {
        it('cleans single mention for display', () => {
            const comment = 'Hello @John Doe[user123] how are you?';
            const result = cleanMentionsForDisplay(comment);
            expect(result).toBe('Hello @John Doe how are you?');
        });

        it('cleans multiple mentions for display', () => {
            const comment =
                'Hello @John Doe[user123] and @Jane Smith[user456], how are you?';
            const result = cleanMentionsForDisplay(comment);
            expect(result).toBe(
                'Hello @John Doe and @Jane Smith, how are you?'
            );
        });

        it('returns original text when no mentions found', () => {
            const comment = 'Hello everyone!';
            const result = cleanMentionsForDisplay(comment);
            expect(result).toBe('Hello everyone!');
        });

        it('handles complex usernames with special characters', () => {
            const comment =
                'Hey @Mary-Jane_Watson[user789] and @Chef.Gordon[user101]!';
            const result = cleanMentionsForDisplay(comment);
            expect(result).toBe('Hey @Mary-Jane_Watson and @Chef.Gordon!');
        });
    });
});

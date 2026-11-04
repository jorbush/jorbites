import sendNotification from '@/app/actions/sendNotification';
import { NotificationType } from '@/app/types/notification';

jest.unmock('@/app/actions/sendNotification');

describe('sendNotification Server Action', () => {
    const originalUrl = process.env.JORBITES_NOTIFIER_URL;
    const originalKey = process.env.JORBITES_NOTIFIER_API_KEY;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JORBITES_NOTIFIER_URL = 'http://notifier.example.com';
        process.env.JORBITES_NOTIFIER_API_KEY = 'test-key';
        (global as any).fetch = jest.fn();
    });

    afterEach(() => {
        process.env.JORBITES_NOTIFIER_URL = originalUrl;
        process.env.JORBITES_NOTIFIER_API_KEY = originalKey;
    });

    it('should be a no-op when userEmail is not provided', async () => {
        await sendNotification({
            type: NotificationType.NEW_COMMENT,
            userEmail: null,
        });
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should send notification request to notifier service with formatted metadata', async () => {
        jest.mocked(fetch).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ status: 'sent' }),
        } as any);

        const result = await sendNotification({
            type: NotificationType.NEW_COMMENT,
            userEmail: 'recipient@example.com',
            params: {
                userName: 'Commenter',
                recipeId: 'r123',
                recipeName: 'Paella',
            },
        });

        expect(fetch).toHaveBeenCalledWith(
            'http://notifier.example.com/notifications',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'test-key',
                },
                body: JSON.stringify({
                    type: NotificationType.NEW_COMMENT,
                    recipient: 'recipient@example.com',
                    metadata: {
                        authorName: 'Commenter',
                        recipeId: 'r123',
                        recipeName: 'Paella',
                    },
                }),
            })
        );
        expect(result).toEqual({ status: 'sent' });
    });

    it('should format RECIPE_REMIX payload with remixRecipeId and originalRecipeTitle', async () => {
        jest.mocked(fetch).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ status: 'sent' }),
        } as any);

        const result = await sendNotification({
            type: NotificationType.RECIPE_REMIX,
            userEmail: 'original_author@example.com',
            params: {
                userName: 'RemixChef',
                recipeId: 'remix-456',
                recipeName: 'Original Carbonara',
            },
        });

        expect(fetch).toHaveBeenCalledWith(
            'http://notifier.example.com/notifications',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'test-key',
                },
                body: JSON.stringify({
                    type: NotificationType.RECIPE_REMIX,
                    recipient: 'original_author@example.com',
                    metadata: {
                        authorName: 'RemixChef',
                        recipeId: 'remix-456',
                        recipeName: 'Original Carbonara',
                        remixRecipeId: 'remix-456',
                        originalRecipeTitle: 'Original Carbonara',
                    },
                }),
            })
        );
        expect(result).toEqual({ status: 'sent' });
    });

    it('should handle notifier service failure gracefully', async () => {
        jest.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn().mockResolvedValue({ error: 'Internal Error' }),
        } as any);

        const result = await sendNotification({
            type: NotificationType.NOTIFICATIONS_ACTIVATED,
            userEmail: 'user@example.com',
        });

        expect(result).toBeUndefined();
    });
});

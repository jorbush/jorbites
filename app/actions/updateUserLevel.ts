interface IParams {
    userId?: string;
}

export default async function updateUserLevel(params: IParams) {
    try {
        const { userId } = params;

        const badgeForgePayload = {
            user_id: userId,
        };

        const badgeForgeResponse = await fetch(
            `${process.env.BADGE_FORGE_URL}/update`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.BADGE_FORGE_API_KEY || '',
                },
                body: JSON.stringify(badgeForgePayload),
            }
        );

        if (!badgeForgeResponse.ok) {
            const errorData = await badgeForgeResponse.json().catch(() => ({}));
            throw new Error(
                `Badge Forge service responded with status ${badgeForgeResponse.status}: ${JSON.stringify(errorData)}`
            );
        }
    } catch (error: any) {
        console.error('Error updating user level:', error);
    }
}

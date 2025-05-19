import prisma from '@/app/libs/prismadb';
import challenges from '@/app/data/weekly-challenges.json';
import { addDays, isBefore } from 'date-fns';

export type ChallengeType = 'ingredient' | 'cuisine' | 'recipe';

interface ChallengeTemplate {
    title: string;
    description: string;
    type: ChallengeType;
    ingredients?: string[];
    cuisines?: string[];
    recipes?: string[];
}

export async function getCurrentChallenge() {
    const now = new Date();

    // Get the current challenge
    const currentChallenge = await prisma.weeklyChallenge.findFirst({
        where: {
            startDate: { lte: now },
            endDate: { gt: now },
        },
    });

    if (currentChallenge) {
        return currentChallenge;
    }

    // If no current challenge exists or it's expired, generate a new one
    return generateNewChallenge();
}

async function generateNewChallenge() {
    // Delete any existing challenges
    await prisma.weeklyChallenge.deleteMany({});

    // Select a random challenge type
    const challengeTypes: ChallengeType[] = ['ingredient', 'cuisine', 'recipe'];
    const randomType =
        challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    // Get the corresponding challenge template
    const template = challenges[
        `${randomType}Challenges`
    ][0] as ChallengeTemplate;

    // Select a random value based on the type
    let value: string;
    switch (randomType) {
        case 'ingredient':
            value =
                template.ingredients![
                    Math.floor(Math.random() * template.ingredients!.length)
                ];
            break;
        case 'cuisine':
            value =
                template.cuisines![
                    Math.floor(Math.random() * template.cuisines!.length)
                ];
            break;
        case 'recipe':
            value =
                template.recipes![
                    Math.floor(Math.random() * template.recipes!.length)
                ];
            break;
    }

    // Create the challenge
    const startDate = new Date();
    const endDate = addDays(startDate, 7); // Challenge lasts for 7 days

    const challenge = await prisma.weeklyChallenge.create({
        data: {
            title: template.title,
            description: template.description.replace(`{${randomType}}`, value),
            type: randomType,
            value,
            startDate,
            endDate,
        },
    });

    return challenge;
}

export function isChallengeActive(challenge: { endDate: Date }) {
    return isBefore(new Date(), challenge.endDate);
}

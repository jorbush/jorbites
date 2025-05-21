'use server';

import prisma from '@/app/libs/prismadb';
import challenges from '@/app/content/events/weekly-challenges.json';
import {
    startOfWeek,
    endOfWeek,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
} from 'date-fns';

export type ChallengeType =
    | 'ingredient'
    | 'cuisine'
    | 'recipe'
    | 'technique'
    | 'dietary';

interface ChallengeTemplate {
    title: string;
    description: string;
    type: ChallengeType;
    ingredients?: string[];
    cuisines?: string[];
    recipes?: string[];
    techniques?: string[];
    dietary?: string[];
}

export interface WeeklyChallenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    value: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Gets the current active challenge or generates a new one if none exists
 */
export async function getCurrentChallenge(): Promise<WeeklyChallenge> {
    const now = new Date();

    // Get the current challenge
    const currentChallenge = await prisma.weeklyChallenge.findFirst({
        where: {
            startDate: { lte: now },
            endDate: { gt: now },
        },
    });

    if (currentChallenge) {
        return currentChallenge as WeeklyChallenge;
    }

    // If no current challenge exists or it's expired, generate a new one
    return generateNewChallenge();
}

/**
 * Generates a new weekly challenge with random type and value
 */
async function generateNewChallenge(): Promise<WeeklyChallenge> {
    // Delete any existing challenges
    await prisma.weeklyChallenge.deleteMany({});

    // Select a random challenge type
    const challengeTypes: ChallengeType[] = [
        'ingredient',
        'cuisine',
        'recipe',
        'technique',
        'dietary',
    ];
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
            value = template
                .ingredients![
                    Math.floor(Math.random() * template.ingredients!.length)
                ].toLowerCase()
                .replace(/\s+/g, '_');
            break;
        case 'cuisine':
            value = template
                .cuisines![
                    Math.floor(Math.random() * template.cuisines!.length)
                ].toLowerCase()
                .replace(/\s+/g, '_');
            break;
        case 'recipe':
            value = template
                .recipes![
                    Math.floor(Math.random() * template.recipes!.length)
                ].toLowerCase()
                .replace(/\s+/g, '_');
            break;
        case 'technique':
            value = template
                .techniques![
                    Math.floor(Math.random() * template.techniques!.length)
                ].toLowerCase()
                .replace(/\s+/g, '_');
            break;
        case 'dietary':
            value = template
                .dietary![
                    Math.floor(Math.random() * template.dietary!.length)
                ].toLowerCase()
                .replace(/\s+/g, '_');
            break;
    }

    // Create the challenge
    const now = new Date();
    const startDate = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday
    const endDate = setMilliseconds(
        setSeconds(
            setMinutes(
                setHours(
                    endOfWeek(now, { weekStartsOn: 1 }), // 1 = Monday
                    23
                ),
                59
            ),
            59
        ),
        999
    );

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

    return challenge as WeeklyChallenge;
}

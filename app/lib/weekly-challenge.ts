import prisma from '@/app/lib/prismadb';
import challenges from '@/app/content/events/weekly-challenges.json';
import {
    startOfWeek,
    endOfWeek,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
} from 'date-fns';
import { logger } from '@/app/lib/axiom/server';

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
 * Gets the current active challenge. Returns null if none exists.
 */
export async function getCurrentChallenge(): Promise<WeeklyChallenge | null> {
    logger.info('lib/weekly-challenge getCurrentChallenge - start');
    const now = new Date();

    // Get the current challenge
    const currentChallenge = await prisma.weeklyChallenge.findFirst({
        where: {
            startDate: { lte: now },
            endDate: { gt: now },
        },
    });

    if (currentChallenge) {
        logger.info(
            'lib/weekly-challenge getCurrentChallenge - found existing challenge',
            {
                challengeId: currentChallenge.id,
            }
        );
        return currentChallenge as WeeklyChallenge;
    }

    logger.info(
        'lib/weekly-challenge getCurrentChallenge - no active challenge found'
    );
    return null;
}

/**
 * Rotates the weekly challenge by generating a new one and deleting existing ones.
 */
export async function rotateWeeklyChallenge(): Promise<WeeklyChallenge> {
    logger.info('lib/weekly-challenge rotateWeeklyChallenge - start');

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

    // Get a random challenge template for the selected type
    const templateList = challenges[
        `${randomType}Challenges`
    ] as ChallengeTemplate[];
    const template =
        templateList[Math.floor(Math.random() * templateList.length)];

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

    const challenge = await prisma.$transaction(async (tx) => {
        // Delete any existing challenges
        await tx.weeklyChallenge.deleteMany({});

        // Create the challenge
        return await tx.weeklyChallenge.create({
            data: {
                title: template.title,
                description: template.description.replace(
                    `{${randomType}}`,
                    value
                ),
                type: randomType,
                value,
                startDate,
                endDate,
            },
        });
    });

    logger.info('lib/weekly-challenge rotateWeeklyChallenge - success', {
        challengeId: challenge.id,
        type: randomType,
        value,
    });
    return challenge as WeeklyChallenge;
}

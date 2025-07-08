import { MetadataRoute } from 'next';
import prisma from '@/app/libs/prismadb';
import fs from 'fs';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://jorbites.com';

    const recipes = await prisma.recipe.findMany({
        select: {
            id: true,
            createdAt: true,
        },
    });

    const recipeEntries = recipes.map((recipe) => ({
        url: `${baseUrl}/recipes/${recipe.id}`,
        lastModified: new Date(recipe.createdAt),
    }));

    const eventsDirectory = path.join(process.cwd(), 'app/content/events/es');
    const eventEntries: MetadataRoute.Sitemap = [];

    if (fs.existsSync(eventsDirectory)) {
        const eventFiles = fs
            .readdirSync(eventsDirectory)
            .filter((file) => file.endsWith('.md'));

        eventFiles.forEach((file) => {
            const slug = file.replace('.md', '');
            eventEntries.push({
                url: `${baseUrl}/events/${slug}`,
                lastModified: new Date(),
                priority: 0.8,
            });
        });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            updatedAt: true,
            createdAt: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
        take: 100,
    });

    const userEntries = users.map((user) => ({
        url: `${baseUrl}/profile/${user.id}`,
        lastModified: user.updatedAt || user.createdAt || new Date(),
        priority: 0.6,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            priority: 1.0,
        },
        ...recipeEntries,
        ...eventEntries,
        ...userEntries,
    ];
}

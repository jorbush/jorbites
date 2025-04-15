import { MetadataRoute } from 'next';
import prisma from '@/app/libs/prismadb';

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

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        ...recipeEntries,
    ];
}

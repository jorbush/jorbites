import prisma from "@/app/libs/prismadb";

export interface IRecipesParams {
    category?: string;
    page?: number;
    limit?: number;
}

export default async function getRecipes(
    params: IRecipesParams
){
    try {
        const { category, page = 1, limit = 10 } = params;

        let query: any = {};

        if (typeof category === 'string') {
            query.category = category;
        }

        const listings = await prisma.listing.findMany({
            where: query,
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit
        });

        const totalListings = await prisma.listing.count({ where: query });

        const safeListings = listings.map((listing) => ({
            ...listing,
            createdAt: listing.createdAt.toISOString()
        }));

        return {
            listings: safeListings,
            totalListings,
            totalPages: Math.ceil(totalListings / limit),
            currentPage: page
        };
    } catch (error: any) {
        throw new Error(error);
    }
}
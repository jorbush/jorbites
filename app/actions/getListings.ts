import prisma from "@/app/libs/prismadb";

export interface IListingsParams {
    category?: string;
}

export default async function getListings(
    params: IListingsParams
){
    try{
        const { category } = params;

        let query: any = {};

        if (typeof category === 'string') {
            query.category = category;
        }
      
        const listings = await prisma.listing.findMany({
            where: query,
            orderBy: {
                createdAt: 'desc'
            }
        })

        const safeListings = listings.map((listing) => ({
            ... listing,
            createdAt: listing.createdAt.toISOString()
        }))

        return safeListings
    } catch (error: any) {
        throw new Error(error)
    }
}
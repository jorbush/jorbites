import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export default async function getCommentsById(
  params: IParams
) {
  try {
    const { listingId } = params;

    const query: any = {};
        
    if (listingId) {
      query.listingId = listingId;
    };

    const comments = await prisma.comment.findMany({
      where: query,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safeComments = comments.map(
      (comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    }));

    return safeComments;
  } catch (error: any) {
    throw new Error(error);
  }
}
import prisma from "@/app/libs/prismadb";

interface IParams {
  recipeId?: string;
}

export default async function getCommentsByRecipeId(
  params: IParams
) {
  try {
    const { recipeId } = params;

    const query: any = {};

    if (recipeId) {
      query.listingId = recipeId;
    };

    const comments = await prisma.comment.findMany({
      where: query,
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const safeComments = comments.map(
      (comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      user: {
        ...comment.user,
        createdAt: comment.user.createdAt.toISOString(),
      updatedAt: comment.user.updatedAt.toISOString(),
      emailVerified:
        comment.user.emailVerified?.toISOString() || null,
      },
    }));

    return safeComments;
  } catch (error: any) {
    throw new Error(error);
  }
}

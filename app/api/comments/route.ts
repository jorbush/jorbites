import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import sendEmail from "@/app/actions/sendEmail";

export async function POST(
  request: Request,
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    recipeId,
    comment
   } = body;

   if (!recipeId || !comment) {
    return NextResponse.error();
  }

  const currentRecipe = await prisma.recipe.findUnique({
    where: {
      id: recipeId,
    },
    include: {
      user: true
    }
  });

  if (currentRecipe?.user.emailNotifications) {
    await sendEmail("You have received a new comment from " + currentUser.name + ".\nIn this recipe: https://jorbites.com/recipes/" + recipeId, currentRecipe?.user.email);
  }

  const recipeAndComment = await prisma.recipe.update({
    where: {
      id: recipeId
    },
    data: {
      comments: {
        create: {
          userId: currentUser.id,
          comment: comment
        }
      }
    }
  });

  return NextResponse.json(recipeAndComment);
}

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
    listingId,
    comment
   } = body;

   if (!listingId || !comment) {
    return NextResponse.error();
  }

  const currentListing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      user: true
    }
  });

  if (currentListing?.user.emailNotifications) {
    await sendEmail("You have received a new comment from " + currentUser.name + ".\nIn this recipe: https://jorbites.com/recipes/" + listingId, currentListing?.user.email);
  }

  const listingAndComment = await prisma.listing.update({
    where: {
      id: listingId
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

  return NextResponse.json(listingAndComment);
}
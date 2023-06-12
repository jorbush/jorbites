import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

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
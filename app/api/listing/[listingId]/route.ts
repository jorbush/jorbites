import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import sendEmail from "@/app/actions/sendEmail";

interface IParams {
    listingId?: string;
}

let isProcessing = false

export async function POST(
    request: Request, 
    { params }: { params: IParams }
) {

  //console.log(isProcessing)

  if (isProcessing) {
    return NextResponse.error();
  }

  isProcessing = true

  const body = await request.json();

  const { 
    operation
    } = body;

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }
  
  const { listingId } = params;

  if (!listingId || typeof listingId !== 'string') {
    throw new Error('Invalid ID');
  }

  const currentListing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      user: true
    }
  });

  let numLikes = currentListing?.numLikes;

  if (!numLikes && numLikes!==0) {
      throw Error()
  }
  
  if (operation === "increment"){
      numLikes++;
      if (currentListing?.user.emailNotifications) {
        await sendEmail("You have received a new like from " + currentUser.name + ".\nIn this recipe: https://jorbites.vercel.app/listings/" + listingId, currentListing?.user.email);
      }
  } else {
      if (numLikes>0){
        numLikes--;
      }
  }
  
  const listing = await prisma.listing.update({
    where: {
      id: listingId
    },
    data: {
      numLikes: numLikes
    }
  });

  isProcessing = false

  return NextResponse.json(listing);
}
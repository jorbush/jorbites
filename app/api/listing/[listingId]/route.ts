import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";

interface IParams {
    listingId?: string;
}

export async function POST(
    request: Request, 
    { params }: { params: IParams }
) {

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
      }
    });
  
    let numLikes = currentListing?.numLikes;
  
    if (!numLikes ) {
        numLikes = 0
    }
    
    if (operation === "increment"){
        numLikes++;
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
  
    return NextResponse.json(listing);
  }
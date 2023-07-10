import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import sendEmail from "@/app/actions/sendEmail";

let isProcessing = false

export async function POST(
  request: Request, 
) {

  //console.log(isProcessing)

  if (isProcessing) {
    return NextResponse.error();
  }

  isProcessing = true

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { 
    title,
    description,
    imageSrc,
    category,
    method,
    ingredients,
    steps,
    minutes,
   } = body;

  Object.keys(body).forEach((value: any) => {
    if (!body[value]) {
        NextResponse.error();
    }
  });

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      imageSrc,
      category,
      method,
      ingredients,
      steps,
      minutes,
      numLikes: 0,
      userId: currentUser.id
    }
  });

  const users = await prisma.user.findMany({
    orderBy: {
        createdAt: 'desc'
    }
  })

  await Promise.all(users.map(async (user) => {
    await sendEmail("There's a new recipe available on Jorbites!\nCheck it out: https://jorbites.vercel.app/listings/" + listing.id, user.email);
  }));   
  
  isProcessing = false

  return NextResponse.json(listing);
}
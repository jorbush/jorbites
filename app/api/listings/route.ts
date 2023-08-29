import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import sendEmail from "@/app/actions/sendEmail";
import setLevelByUserId from "@/app/actions/setLevelByUserId";

export async function POST(
  request: Request, 
) {

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

  const listingExist = await prisma.listing.findFirst({
    where: {
      imageSrc: imageSrc as string,
    }
  })?? null;

  console.log(listingExist)

  if (listingExist !== null){
    return NextResponse.error();
  }

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
    if (user.emailNotifications){
      await sendEmail("There's a new recipe available on Jorbites!\nCheck it out: https://jorbites.com/recipes/" + listing.id, user.email);
    }
  }));   

  const newUser = await setLevelByUserId({userId: currentUser.id})
  
  return NextResponse.json(listing);
}
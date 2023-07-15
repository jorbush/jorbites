import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import sendEmail from "@/app/actions/sendEmail";

export async function PUT(
  request: Request, 
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const user = await prisma.user.update({
    where: {
      id: currentUser.id
    },
    data: {
      emailNotifications: !currentUser.emailNotifications
    }
  });

  if (user.emailNotifications){
    await sendEmail("Email notifications have been activated.", user.email);
  }

  return NextResponse.json(user);
}

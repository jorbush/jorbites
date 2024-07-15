import { Listing, User, Comment } from "@prisma/client";

export type SafeRecipe = Omit<
    Listing,
    "createdAt"
> & {
    createdAt: string
}

export type SafeComment = Omit<
  Comment,
  "createdAt"
> & {
  createdAt: string;
  user: SafeUser;
};


export type SafeUser = Omit<
    User,
    "createdAt" | "updatedAt" | "emailVerified"
> & {
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
}

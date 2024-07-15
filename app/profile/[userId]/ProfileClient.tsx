'use client';

import { SafeRecipe, SafeUser } from "@/app/types";

import Heading from "@/app/components/Heading";
import Container from "@/app/components/Container";
import RecipeCard from "@/app/components/recipes/RecipeCard";

interface ProfileClientProps {
  recipes: SafeRecipe[],
  currentUser?: SafeUser | null,
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  recipes,
  currentUser
}) => {
  return (
    <Container>
      <div
        className="
          mt-6
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
        "
      >
        {recipes.map((recipe: any) => (
          <RecipeCard
            currentUser={currentUser}
            key={recipe.id}
            data={recipe}
          />
        ))}
      </div>
    </Container>
   );
}

export default ProfileClient;

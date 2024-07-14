'use client';

import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeComment, SafeListing, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import RecipeHead from "@/app/components/recipes/RecipeHead";
import RecipeInfo from "@/app/components/recipes/RecipeInfo";
import { preparationMethods } from "@/app/components/modals/RecipeModal";
import Comments from "@/app/components/comments/Comments";
import DeleteRecipeButton from "@/app/components/recipes/DeleteRecipeButton";

interface RecipeClientProps {
  comments?: SafeComment[];
  recipe: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const RecipeClient: React.FC<RecipeClientProps> = ({
  recipe,
  currentUser,
  comments
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const category = useMemo(() => {
     return categories.find((item) =>
      item.label === recipe.category);
  }, [recipe.category]);

  const method = useMemo(() => {
    return preparationMethods.find((item) =>
     item.label === recipe.method);
 }, [recipe.method]);

  const onCreateComment = useCallback((comment: string) => {
      if (!currentUser) {
        return loginModal.onOpen();
      }
      setIsLoading(true);

      axios.post('/api/comments', {
        comment: comment,
        listingId: recipe?.id
      })
      .then(() => {
        toast.success('Recipe commented!');
      })
      .catch(() => {
        toast.error('Something went wrong.');
      })
      .finally(() => {
        setIsLoading(false);
        router.refresh()
      })
  },
  [
    recipe?.id,
    router,
    currentUser,
    loginModal
  ]);

  return (
    <Container>
      <div
        className="
          max-w-screen-lg
          mx-auto
        "
      >
        <div className="flex flex-col gap-6">
          <RecipeHead
            title={recipe.title}
            minutes={recipe.minutes.toString()}
            imagesSrc={[recipe.imageSrc, ...recipe.extraImages]}
            id={recipe.id}
            currentUser={currentUser}
          />
            <div
            className="
              grid
              grid-cols-1
              md:grid-cols-1
              md:gap-10
              mt-1
            " >
                <RecipeInfo
                    id={recipe.id}
                    user={recipe.user}
                    likes={recipe.numLikes}
                    currentUser={currentUser}
                    category={category}
                    method={method}
                    description={recipe.description}
                    ingredients={recipe.ingredients}
                    steps={recipe.steps}
                />

          </div>
          <Comments
            currentUser={currentUser}
            onCreateComment={onCreateComment}
            listingId={recipe.id}
            comments={comments}
          />
          {currentUser?.id === recipe.userId&&(
            <DeleteRecipeButton id={recipe.id}/>
          )}
        </div>
      </div>
    </Container>
   );
}

export default RecipeClient;

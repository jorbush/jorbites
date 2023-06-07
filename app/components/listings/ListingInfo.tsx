'use client';

import { IconType } from "react-icons";
import { SafeUser } from "@/app/types";
import Avatar from "../Avatar";
import ListingCategoryAndMethod from "./ListingCategoryAndMethod";


interface ListingInfoProps {
  user: SafeUser,
  description: string;
  steps: string[];
  ingredients: string[];
  category: {
    icon: IconType,
    label: string;
    description: string;
  } | undefined;
  method: {
    icon: IconType,
    label: string;
  } | undefined
}

const ListingInfo: React.FC<ListingInfoProps> = ({
  user,
  description,
  ingredients,
  steps,
  category,
  method
}) => {
  return ( 
    <div className="col-span-4 flex flex-col gap-8 pl-2 pr-2">
      <div className="flex flex-col gap-2">
        <div 
          className="
            text-xl 
            font-semibold 
            flex 
            flex-row 
            items-center
            gap-2
          "
        >
          <Avatar src={user?.image} />
          <div>{user?.name}</div>
          
        </div>
        <div className="
            flex 
            flex-row 
            items-center 
            gap-4 
            font-light
            text-neutral-500
          "
        >
          <div>
            {steps.length} steps
          </div>
          <div>
            {ingredients.length} ingredients
          </div>
        </div>
      </div>
      <ListingCategoryAndMethod category={category} method={method}/>
      <hr />
      <div className="
      text-lg font-light text-neutral-500">
        {description}
      </div>
      { (ingredients.length>0) && (
        <>
            <hr />
            <div>
                <div 
                    className="
                    text-xl 
                    font-semibold 
                    flex 
                    flex-row 
                    items-center
                    gap-2
                    "
                >
                    Ingredients
                </div>
                <ul className="list-disc pl-9 pt-4">
                    {ingredients.map((ingredient, index) => (
                        <li key={index} className="mb-2">
                            {ingredient}
                        </li>
                    ))}
                </ul>
            </div>
        </>
      )}
      { (steps.length>0) && (
        <>
            <hr />
            <div>
                <div 
                    className="
                    text-xl 
                    font-semibold 
                    flex 
                    flex-row 
                    items-center
                    gap-2
                    "
                >
                    Steps
                </div>
                <ol className="list-decimal pl-9 pt-4">
                {steps.map((step, index) => (
                    <li key={index} className="mb-2 ">
                        {step}
                    </li>
                ))}
                </ol>
            </div>
        </>
      )}
    </div>
  );
}
 
export default ListingInfo;

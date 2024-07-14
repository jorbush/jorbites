import { IconType } from "react-icons";
import ListingCategory from "./ListingCategory";

interface ListingInfoProps {
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

const ListingCategoryAndMethod: React.FC<ListingInfoProps> = ({
    category,
    method
}) => {
    return (
        <>
        <hr/>
        <div 
        className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-2 
          lg:grid-cols-2
          xl:grid-cols-2
          2xl:grid-cols-2
          gap-8
          dark:text-neutral-100
        "
      >
            {category && (
            <>
              <ListingCategory
                icon={category.icon} 
                label={category?.label}
                description={""} 
              />
            </>
          )}
          {method && (
            <>
              <ListingCategory
                icon={method.icon} 
                label={method?.label}
                description={""} 
              />
            </>
          )}
        </div>
        </>
        
    );
}
export default ListingCategoryAndMethod
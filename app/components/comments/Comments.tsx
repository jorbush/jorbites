"use client";

import { SafeUser } from "@/app/types";
import CommentBox from "./CommentBox";

interface CommentsProps {
  currentUser?: SafeUser | null;
}

const Comments: React.FC<CommentsProps> = ({ currentUser }) => {
    return (
        <div className="
            flex
            flex-col
            pr-2
            pl-2
        ">
            <hr/>
            <div 
                className="
                text-xl 
                font-semibold 
                flex 
                flex-row 
                items-center
                gap-2
                mb-4
                mt-8
                "
            >
                Comments
            </div>
            <CommentBox userImage={currentUser?.image}/>
            {/* TODO: LIST COMMENTS */}
        </div>
    );
}

export default Comments
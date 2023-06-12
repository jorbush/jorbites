"use client";

import { SafeComment, SafeUser } from "@/app/types";
import CommentBox from "./CommentBox";
import Comment from "./Comment";

interface CommentsProps {
  currentUser?: SafeUser | null;
  onCreateComment: (comment: string) => void;
  listingId: string;
  comments?: SafeComment[];
}

const Comments: React.FC<CommentsProps> = ({ 
    currentUser, 
    onCreateComment, 
    listingId, 
    comments
}) => {
    
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
            <div className="mr-4 ml-4">
               <CommentBox userImage={currentUser?.image} onCreateComment={onCreateComment}/>
                {comments?.map((comment: SafeComment) => (
                
                <div className="mr-2 ml-2">
                <hr/>
                    <Comment key={comment.id} userImage={comment.user.image} comment={comment.comment} createdAt={comment.createdAt}/>
                </div>
                    
                ))} 
            </div>
            
            
        </div>
    );
}

export default Comments
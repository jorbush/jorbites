"use client";

import { SafeComment, SafeUser } from "@/app/types";
import CommentBox from "./CommentBox";
import Comment from "./Comment";
import { useTranslation } from 'react-i18next';


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
    const { t } = useTranslation();

    
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
                dark:text-neutral-100
                "
            >
                {t('comments')}
            </div>
            <div className="mr-4 ml-4">
               <CommentBox userImage={currentUser?.image} onCreateComment={onCreateComment}/>
                {comments?.map((comment: SafeComment) => (
                
                <div key={comment.id} className="mr-2 ml-2">
                <hr/>
                    <Comment 
                        userImage={comment.user.image} 
                        comment={comment.comment} 
                        createdAt={comment.createdAt}
                        userName={comment.user.name??""}
                    />
                </div>
                    
                ))} 
            </div>
            
            
        </div>
    );
}

export default Comments
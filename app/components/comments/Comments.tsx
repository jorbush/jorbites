'use client';

import { SafeComment, SafeUser } from '@/app/types';
import CommentBox from '@/app/components/comments/CommentBox';
import Comment from '@/app/components/comments/Comment';
import { useTranslation } from 'react-i18next';

/* eslint-disable unused-imports/no-unused-vars */
interface CommentsProps {
    currentUser?: SafeUser | null;
    onCreateComment: (comment: string) => void;
    comments?: SafeComment[];
}

const Comments: React.FC<CommentsProps> = ({
    currentUser,
    onCreateComment,
    comments,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col pl-2 pr-2">
            <hr />
            <div className="mb-4 mt-8 flex flex-row items-center gap-2 text-xl font-semibold dark:text-neutral-100">
                {t('comments')}
            </div>
            <div className="ml-4 mr-4">
                <CommentBox
                    userImage={currentUser?.image}
                    onCreateComment={onCreateComment}
                />
                {comments?.map((comment: SafeComment) => (
                    <div
                        key={comment.id}
                        className="ml-2 mr-2"
                    >
                        <hr />
                        <Comment
                            userId={comment.user.id}
                            userImage={comment.user.image}
                            comment={comment.comment}
                            createdAt={comment.createdAt}
                            userName={
                                comment.user.name ?? ''
                            }
                            verified={comment.user.verified}
                            canDelete={
                                currentUser?.id ===
                                comment.userId
                            }
                            commentId={comment.id}
                            userLevel={comment.user.level}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;

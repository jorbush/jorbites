import React from 'react';
import Avatar from '../Avatar';

interface CommentProps {
  userImage: string | undefined | null;
  comment: string;
  createdAt: string;
}

const Comment: React.FC<CommentProps> = ({ userImage, comment, createdAt }) => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex-shrink-0">
        <Avatar src={userImage} />
      </div>
      <div className="ml-3">
        <p className="text-gray-800">{comment}</p>
        <p className="text-gray-500 text-sm">{createdAt}</p>
      </div>
    </div>
  );
};

export default Comment;

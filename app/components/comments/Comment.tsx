"use client";

import React from 'react';
import { format } from 'date-fns';
import Avatar from '../Avatar';

interface CommentProps {
  userImage: string | undefined | null;
  comment: string;
  createdAt: string;
}

const Comment: React.FC<CommentProps> = ({ userImage, comment, createdAt }) => {
  const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy HH:mm');

  return (
    <div className="flex items-start m-4">
      <div className="flex-shrink-0 mt-2">
        <Avatar src={userImage} />
      </div>
      <div className="ml-4 flex-grow">
        <p className="text-gray-800">{comment}</p>
        <div className="flex flex-col text-gray-400 text-sm">
          {formattedDate}
        </div>
      </div>
    </div>
  );
};

export default Comment;

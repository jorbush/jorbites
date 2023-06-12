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
    <div className="flex items-start mt-2 mb-2 mr-1 ml-1">
      <div className="flex-shrink-0 mt-2">
        <Avatar src={userImage} />
      </div>
      <div className="ml-4 mt-2 flex-grow">
        <p className="text-gray-800 whitespace-normal truncate text-justify" style={{ maxWidth: '60vh' }}>{comment}</p>
        <div className="flex flex-col text-gray-400 text-sm items-end">
          {formattedDate}
        </div>
      </div>
    </div>
  );
};

export default Comment;


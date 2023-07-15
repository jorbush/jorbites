"use client";

import React from 'react';
import { format } from 'date-fns';
import Avatar from '../Avatar';
import { MdVerified } from 'react-icons/md';

interface CommentProps {
  userImage: string | undefined | null;
  comment: string;
  createdAt: string;
  userName: string;
  verified?: boolean;
}

const Comment: React.FC<CommentProps> = ({ userImage, comment, createdAt,userName, verified }) => {
  const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy HH:mm');
  const words = comment.split(' ');

  // Verificar si alguna palabra es demasiado larga
  const isLongWord = words.some((word) => word.length > 20);

  return (
    <div className="flex items-start mt-2 mb-2 mr-1 ml-1">
      <div className="flex-shrink-0 mt-2">
        <Avatar src={userImage} />
      </div>
      <div className="ml-4 mt-2 flex-grow">
        <div className='flex flex-row'>
          <p
              className={`text-gray-800 dark:text-neutral-100 whitespace-normal truncate text-justify font-bold ${
                isLongWord ? 'break-all' : ''
              }`}
            >
              {userName}
              
          </p>
          {verified && (
              <MdVerified className="text-green-450 mt-1 ml-1"/>
          )}
        </div>
        <p
          className={`text-gray-800 dark:text-neutral-100 whitespace-normal truncate text-justify ${
            isLongWord ? 'break-all' : ''
          }`}
        >
          {comment}
        </p>
        <div className="flex flex-col text-gray-400 text-sm items-end">
          {formattedDate}
        </div>
      </div>
    </div>
  );
};

export default Comment;



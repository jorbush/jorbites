"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import Avatar from '../Avatar';
import { MdDelete, MdVerified } from 'react-icons/md';
import ConfirmModal from '../modals/ConfirmModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CommentProps {
  userImage: string | undefined | null;
  comment: string;
  createdAt: string;
  userName: string;
  canDelete?: boolean;
  verified?: boolean;
  commentId: string;
}

const Comment: React.FC<CommentProps> = ({ 
  userImage, 
  comment, 
  createdAt,
  userName, 
  canDelete, 
  verified, 
  commentId, 
}) => {
  const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy HH:mm');
  const words = comment.split(' ');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si alguna palabra es demasiado larga
  const isLongWord = words.some((word) => word.length > 20);

  const deleteComment = () => {
    setIsLoading(true);

    axios.delete(`/api/comments/${commentId}`)
    .then(() => {
      toast.success('Comment deleted!');
      router.refresh()
    })
    .catch(() => {
      toast.error('Something went wrong.');
    })
    .finally(() => {
      setIsLoading(false);
    })
  }

  return (
    <div className="flex items-start mt-2 mb-2 mr-1 ml-1 relative">
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
        {canDelete && (<MdDelete
          size={20}
          className="
            absolute
            right-1
            top-2
            text-rose-500
          "
          onClick={() => setConfirmModalOpen(true)}
        />)}
        <ConfirmModal 
          open={confirmModalOpen} 
          setIsOpen={setConfirmModalOpen} 
          onConfirm={deleteComment}
        />
      </div>
    </div>
  );
};

export default Comment;



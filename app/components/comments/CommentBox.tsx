"use client";

import React from 'react';
import { useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import Avatar from '../Avatar';
import { toast } from 'react-hot-toast';

interface CommentBoxProps {
  userImage: string | undefined | null;
}

const CommentBox: React.FC<CommentBoxProps> = ({ userImage }) => {
  const [comment, setComment] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes realizar alguna acción con el comentario, como enviarlo al servidor.
    // Por ahora, solo mostraremos el comentario en la consola.
    if (comment === ""){
      toast.error('Comment can not be empty');
      return
    }
    toast.success('Comment: '+comment);
    setComment('');
  };

  return (
    <div className="flex items-center">
      <div className='m-4'>
        <Avatar src={userImage} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex-grow mt-2">
        <textarea
          className="w-full p-2 h-11 bg-gray-100 border border-gray-100 rounded-md resize-none focus:outline-none focus:ring-0"
          placeholder="Write a comment..."
          value={comment}
          onChange={handleInputChange}
        />
      </form>

      <button
        type="submit"
        onClick={handleSubmit}
        className="m-4 text-green-450 hover:text-green-500 transition-colors"
      >
        <HiOutlinePaperAirplane size={20} />
      </button>
    </div>
  );
};

export default CommentBox;

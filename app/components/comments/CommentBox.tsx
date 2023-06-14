"use client";

import React, { useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import Avatar from '../Avatar';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface CommentBoxProps {
  userImage: string | undefined | null;
  onCreateComment: (comment: string) => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({ userImage, onCreateComment }) => {
  const [comment, setComment] = useState('');
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const { t } = useTranslation();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setButtonDisabled(true);
    if (comment.trim() === "") {
      toast.error('Comment cannot be empty');
      
    } else {
      onCreateComment(comment)
    }
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulación de una operación asincrónica de 2 segundos
    setComment('');
    setButtonDisabled(false);
  };

  return (
    <div className="flex items-center mb-4">
      <div className="mt-4 mb-4 mr-4">
        <Avatar src={userImage} />
      </div>

      <form onSubmit={handleSubmit} className="flex-grow mt-2">
        <textarea
          className="w-full p-2 h-11 bg-gray-100 border border-gray-100 rounded-md resize-none focus:outline-none focus:ring-0"
          placeholder={t('write_comment')??"Write a comment..."}
          value={comment}
          onChange={handleInputChange}
        />
      </form>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isButtonDisabled}
        className={`mt-4 mb-4 ml-4 text-green-450  ${
          isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <HiOutlinePaperAirplane size={20} />
      </button>
    </div>
  );
};

export default CommentBox;

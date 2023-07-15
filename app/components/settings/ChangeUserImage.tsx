'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CldUploadWidget } from 'next-cloudinary';
import { FaRegSave } from 'react-icons/fa'
import Image from 'next/image';


interface ChangeUserImageProps {
  currentUser?: SafeUser | null 
}

const uploadPreset = "ibbxxl6z";

const ChangeUserImageSelector: React.FC<ChangeUserImageProps> = ({
  currentUser
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [newImage, setNewImage] = useState(currentUser?.image);
  const [canSave, setCanSave] = useState(false);


  const updateUserProfile = () => {
    setIsLoading(true);
    
    axios.put(`/api/userImage/${currentUser?.id}`, {
      userImage: newImage
    })
    .then(() => {
      toast.success('Image updated!');
    })
    .catch(() => {
      toast.error('Something went wrong.');
    })
    .finally(() => {
      setIsLoading(false);
      setCanSave(false)
      router.refresh()
    })
    
  };

  const handleUpload = useCallback((result: any) => {
    setNewImage(result.info.secure_url)
    setCanSave(true)
  }, []);

  return (
    <div className="flex items-center">
      <div className="flex-1">
        <p className="text-left">{t('update_user_image')}</p>
      </div>
      <div className="flex items-center">
        <CldUploadWidget 
          onUpload={handleUpload} 
          uploadPreset={uploadPreset}
          options={{
            maxFiles: 1
          }}
        >
          {({ open }) => {
            return (
              <>
                { (
                  <div className="
                    flex flex-row
                  ">
                    <Image
                      className="rounded-full"
                      height="30"
                      width="30"
                      alt="Upload" 
                      src={newImage|| "/images/placeholder.jpg"} 
                      onClick={() => open?.()}
                    />
                    
                    {canSave && (
                      <FaRegSave 
                        className="mt-1 ml-2  h-5 w-5 text-green-450" 
                        onClick={updateUserProfile}
                      />
                    )}

                  </div>
                )}
              </>
              
            ) 
          }}
        </CldUploadWidget>
      </div>
    </div>
  );
};

export default ChangeUserImageSelector;

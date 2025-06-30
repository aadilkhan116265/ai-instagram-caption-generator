import React, { useRef, useCallback } from 'react';
import { UploadIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
  image: string | null;
  setImage: (image: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ image, setImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setImage]);

  const handleContainerClick = () => {
    if (!image && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`relative flex items-center justify-center h-full w-full bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-indigo-500 transition-all duration-300 ${image ? 'p-0' : 'p-4'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {image ? (
        <>
          <img src={image} alt="Upload preview" className="object-cover h-full w-full rounded-md" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </>
      ) : (
        <div className="text-center text-gray-500">
          <UploadIcon className="mx-auto h-10 w-10 mb-2" />
          <p className="font-semibold">Click to upload</p>
          <p className="text-sm">PNG, JPG, WEBP</p>
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface CaptionCardProps {
  caption: string;
}

export const CaptionCard: React.FC<CaptionCardProps> = ({ caption }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex flex-col justify-between shadow-lg h-full backdrop-blur-sm transform hover:-translate-y-1 transition-transform duration-300">
      <p className="text-gray-300 mb-4 whitespace-pre-wrap">{caption}</p>
      <button
        onClick={handleCopy}
        className={`mt-auto w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm font-semibold ${
          isCopied
            ? 'bg-green-600/30 text-green-300'
            : 'bg-indigo-600/40 hover:bg-indigo-600/70 text-indigo-300'
        }`}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        {isCopied ? 'Copied!' : 'Copy Caption'}
      </button>
    </div>
  );
};

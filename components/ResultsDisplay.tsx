import React, { useState } from 'react';
import type { GeneratedContent } from '../types';
import { CaptionCard } from './CaptionCard';
import { CopyIcon, CheckIcon } from './icons';

interface ResultsDisplayProps {
  content: GeneratedContent;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ content }) => {
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const handleCopyHashtags = () => {
    const hashtagText = content.hashtags.join(' ');
    navigator.clipboard.writeText(hashtagText);
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  return (
    <div className="mt-10 animate-fade-in">
      <section id="captions">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          Generated Captions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.captions.map((caption, index) => (
            <CaptionCard key={index} caption={caption} />
          ))}
        </div>
      </section>

      <section id="hashtags" className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            Suggested Hashtags
          </h2>
          <button
            onClick={handleCopyHashtags}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {copiedHashtags ? <CheckIcon className="h-5 w-5 text-green-400"/> : <CopyIcon className="h-5 w-5"/>}
            {copiedHashtags ? 'Copied!' : 'Copy All'}
          </button>
        </div>
        <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-indigo-200 leading-relaxed">
            {content.hashtags.join(' ')}
          </p>
        </div>
      </section>
    </div>
  );
};

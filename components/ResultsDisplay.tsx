import React, { useState } from 'react';
// import type { GeneratedContent } from '../types'; // This import might not be strictly needed if type is inlined
import { CaptionCard } from './CaptionCard';
import { CopyIcon, CheckIcon } from './icons';

// UPDATED: ResultsDisplayProps interface
interface ResultsDisplayProps {
  // Now expects captions as a direct string array, and hashtags as a direct string array
  content: { captions: string[]; hashtags: string[] }; 
  onLoadMore: () => void;      // NEW: Function to call when "Load More" is clicked
  isLoadingMore: boolean;      // NEW: Boolean to indicate if more content is loading
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ content, onLoadMore, isLoadingMore }) => {
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
          {/* Ensure content.captions is correctly an array of strings */}
          {content.captions.map((caption, index) => (
            <CaptionCard key={index} caption={caption} />
          ))}
        </div>

        {/* NEW SECTION: Load More Button */}
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore} // Call the onLoadMore prop function
            disabled={isLoadingMore} // Disable button when loading
            className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoadingMore ? 'Loading More...' : 'Load More Captions'}
          </button>
        </div>
        {/* END NEW SECTION */}

      </section>

      <section id="hashtags" className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            Suggested Hashtags
          </h2>
          {/* Only show copy button if there are hashtags */}
          {content.hashtags && content.hashtags.length > 0 && (
            <button
              onClick={handleCopyHashtags}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {copiedHashtags ? <CheckIcon className="h-5 w-5 text-green-400"/> : <CopyIcon className="h-5 w-5"/>}
              {copiedHashtags ? 'Copied!' : 'Copy All'}
            </button>
          )}
        </div>
        <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-indigo-200 leading-relaxed">
            {/* Ensure content.hashtags is correctly an array of strings */}
            {content.hashtags.join(' ')}
          </p>
        </div>
      </section>
    </div>
  );
};

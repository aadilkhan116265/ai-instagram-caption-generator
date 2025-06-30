import React from 'react';
import { InstagramIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-10">
      <div className="flex justify-center items-center gap-4 mb-2">
         <InstagramIcon />
         <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 text-transparent bg-clip-text">
            AI Caption Generator
         </h1>
      </div>
      <p className="text-lg text-indigo-300">Craft the perfect post with AI-powered captions & hashtags</p>
    </header>
  );
};
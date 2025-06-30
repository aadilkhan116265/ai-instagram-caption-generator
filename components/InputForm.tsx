import React from 'react';
import { ImageUploader } from './ImageUploader';

interface InputFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ topic, setTopic, image, setImage, onGenerate, isLoading }) => {
  return (
    <div className="p-6 md:p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="topic" className="mb-2 font-semibold text-indigo-300">
            1. Describe your post
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'A beautiful sunset over the mountains'"
            className="flex-grow w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none"
            rows={6}
          />
        </div>
        
        <div className="flex flex-col">
          <p className="mb-2 font-semibold text-indigo-300">
            2. (Optional) Add an image
          </p>
          <ImageUploader image={image} setImage={setImage} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onGenerate}
          disabled={isLoading || (!topic && !image)}
          className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? 'Generating...' : '✨ Generate Content'}
        </button>
      </div>
    </div>
  );
};

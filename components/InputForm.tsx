import React, { useState } from 'react'; // <-- Import useState
import { ImageUploader } from './ImageUploader';

// Update InputFormProps to include new parameters for onGenerate
interface InputFormProps {
  topic: string;
  setTopic: (topic: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
  // onGenerate now accepts the selected caption style and length
  onGenerate: (style: 'basic' | 'professional', length: 'small' | 'big') => void; // <-- UPDATED PROP
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ topic, setTopic, image, setImage, onGenerate, isLoading }) => {
  // Add state for the new caption options, with default values
  const [captionStyle, setCaptionStyle] = useState<'basic' | 'professional'>('basic');
  const [captionLength, setCaptionLength] = useState<'small' | 'big'>('small');

  // New handler for the Generate button click
  const handleGenerateClick = () => {
    // Pass the current state values to the onGenerate prop
    onGenerate(captionStyle, captionLength);
  };

  return (
    <div className="p-6 md:p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="topic" className="mb-2 font-semibold text-indigo-300">
            1. Describe your post / अपने पोस्ट का वर्णन करें
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Drop the vibe. I’ll drop the fire caption. 🔥'"
            className="flex-grow w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none"
            rows={6}
          />
        </div>

        <div className="flex flex-col">
          <p className="mb-2 font-semibold text-indigo-300">
            2. (Optional) Add an image / इमेज जोड़ें
          </p>
          <ImageUploader image={image} setImage={setImage} />
        </div>
      </div>

      {/* NEW SECTION: Caption Style Selection */}
      <div className="mt-6"> {/* Added margin top for spacing */}
        <p className="mb-2 font-semibold text-indigo-300">
          3. Choose Caption Style:
        </p>
        <div className="flex flex-wrap gap-4"> {/* Use flexbox for layout */}
          <label className="inline-flex items-center text-gray-300">
            <input
              type="radio"
              name="captionStyle"
              value="basic"
              checked={captionStyle === 'basic'}
              onChange={() => setCaptionStyle('basic')}
              className="form-radio text-indigo-500 h-4 w-4" // Tailwind CSS for form radio
            />
            <span className="ml-2">Basic</span>
          </label>
          <label className="inline-flex items-center text-gray-300">
            <input
              type="radio"
              name="captionStyle"
              value="professional"
              checked={captionStyle === 'professional'}
              onChange={() => setCaptionStyle('professional')}
              className="form-radio text-indigo-500 h-4 w-4"
            />
            <span className="ml-2">Professional</span>
          </label>
        </div>
      </div>

      {/* NEW SECTION: Caption Length Selection */}
      <div className="mt-4"> {/* Added margin top for spacing */}
        <p className="mb-2 font-semibold text-indigo-300">
          4. Choose Caption Length:
        </p>
        <div className="flex flex-wrap gap-4"> {/* Use flexbox for layout */}
          <label className="inline-flex items-center text-gray-300">
            <input
              type="radio"
              name="captionLength"
              value="small"
              checked={captionLength === 'small'}
              onChange={() => setCaptionLength('small')} // Corrected here
              className="form-radio text-indigo-500 h-4 w-4"
            />
            <span className="ml-2">Small</span>
          </label>
          <label className="inline-flex items-center text-gray-300">
            <input
              type="radio"
              name="captionLength"
              value="big"
              checked={captionLength === 'big'}
              onChange={() => setCaptionLength('big')} // Corrected here
              className="form-radio text-indigo-500 h-4 w-4"
            />
            <span className="ml-2">Big</span>
          </label>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleGenerateClick} // Call the new handler
          disabled={isLoading || (!topic && !image)}
          className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? 'Generating...' : '✨ Generate Content'}
        </button>
      </div>
    </div>
  );
};

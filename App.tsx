import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateInstagramContent } from './services/geminiService'; // Your service call
import type { GeneratedContent } from './types';
import { Footer } from './components/Footer';
import { IntroSection } from './components/IntroSection';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UPDATED: handleGenerate now accepts style and length parameters
  const handleGenerate = useCallback(async (
    style: 'basic' | 'professional', // <-- NEW PARAMETER
    length: 'small' | 'big'          // <-- NEW PARAMETER
  ) => {
    if (!topic && !image) {
      setError('Please provide a topic or an image to generate content.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      // UPDATED: Pass style and length to your service function
      const result = await generateInstagramContent(topic, image, style, length);
      setGeneratedContent(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, image]); // Depend on topic and image for useCallback

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        <main>
          {/* InputForm's onGenerate prop is now handleGenerate, which accepts the new parameters */}
          <InputForm
            topic={topic}
            setTopic={setTopic}
            image={image}
            setImage={setImage}
            onGenerate={handleGenerate} // This handleGenerate now expects the two new parameters from InputForm
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-indigo-300">AI is thinking...</p>
            </div>
          )}

          {generatedContent ? (
            <ResultsDisplay content={generatedContent} />
          ) : (
            !isLoading && !error && <IntroSection />
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;

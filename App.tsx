import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateInstagramContent } from './services/geminiService';
import type { GeneratedContent } from './types';
import { Footer } from './components/Footer';
import { IntroSection } from './components/IntroSection';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic && !image) {
      setError('Please provide a topic or an image to generate content.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const result = await generateInstagramContent(topic, image);
      setGeneratedContent(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, image]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        <main>
          <InputForm
            topic={topic}
            setTopic={setTopic}
            image={image}
            setImage={setImage}
            onGenerate={handleGenerate}
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

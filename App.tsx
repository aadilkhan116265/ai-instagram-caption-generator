import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateInstagramContent } from './services/geminiService'; // Your service call
// import type { GeneratedContent } from './types'; // <-- REMOVE THIS LINE
import { Footer } from './components/Footer';
import { IntroSection } from './components/IntroSection';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  // --- UPDATED STATE FOR LOAD MORE FEATURE ---
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<'basic' | 'professional'>('basic');
  const [selectedCaptionLength, setSelectedCaptionLength] = useState<'small' | 'big'>('small');

  const [allGeneratedCaptions, setAllGeneratedCaptions] = useState<string[]>([]);
  const [currentHashtags, setCurrentHashtags] = useState<string[]>([]);
  // --- REMOVED: generatedContent state is no longer used here ---
  // const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  // --- END UPDATED STATE ---

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // handleGenerate for initial content generation
  const handleGenerate = useCallback(async () => {
    if (!topic && !image) {
      setError('Please provide a topic or an image to generate content.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAllGeneratedCaptions([]); // Clear captions for a fresh generation
    setCurrentHashtags([]);     // Clear hashtags for a fresh generation

    try {
      const result = await generateInstagramContent(topic, image, selectedCaptionStyle, selectedCaptionLength);
      setAllGeneratedCaptions(result.captions); // Set the first batch of captions
      setCurrentHashtags(result.hashtags);       // Set the hashtags
    } catch (err) {
      console.error("Error during initial generation:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during initial generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, image, selectedCaptionStyle, selectedCaptionLength]);


  // handleLoadMore for appending captions
  const handleLoadMore = useCallback(async () => {
    if (!topic && !image) {
      setError('Cannot load more content without a topic or image.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateInstagramContent(topic, image, selectedCaptionStyle, selectedCaptionLength);
      setAllGeneratedCaptions(prevCaptions => [...prevCaptions, ...result.captions]);
    } catch (err) {
      console.error("Error during 'Load More' generation:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while loading more. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, image, selectedCaptionStyle, selectedCaptionLength]);


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
            captionStyle={selectedCaptionStyle}
            setCaptionStyle={setSelectedCaptionStyle}
            captionLength={selectedCaptionLength}
            setCaptionLength={setSelectedCaptionLength}
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

          {allGeneratedCaptions.length > 0 && !isLoading && !error ? (
            <ResultsDisplay
              content={{ captions: allGeneratedCaptions, hashtags: currentHashtags }}
              onLoadMore={handleLoadMore}
              isLoadingMore={isLoading}
            />
          ) : (
            !isLoading && !error && allGeneratedCaptions.length === 0 && <IntroSection />
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;

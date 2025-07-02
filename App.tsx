import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay'; // Will be updated to receive new props
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateInstagramContent } from './services/geminiService';
import type { GeneratedContent } from './types'; // Assuming this type is still used or adapted
import { Footer } from './components/Footer';
import { IntroSection } from './components/IntroSection';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  // --- UPDATED STATE FOR LOAD MORE FEATURE ---
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<'basic' | 'professional'>('basic'); // State for selected style
  const [selectedCaptionLength, setSelectedCaptionLength] = useState<'small' | 'big'>('small');       // State for selected length

  const [allGeneratedCaptions, setAllGeneratedCaptions] = useState<string[]>([]); // To store ALL captions
  const [currentHashtags, setCurrentHashtags] = useState<string[]>([]);           // To store hashtags (typically generated once)
  // --- END UPDATED STATE ---

  const [isLoading, setIsLoading] = useState<boolean>(false); // Used for both initial and load more
  const [error, setError] = useState<string | null>(null);


  // handleGenerate for initial content generation
  const handleGenerate = useCallback(async () => { // No longer accepts style/length here directly from InputForm
    if (!topic && !image) {
      setError('Please provide a topic or an image to generate content.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAllGeneratedCaptions([]); // Clear captions for a fresh generation
    setCurrentHashtags([]);     // Clear hashtags for a fresh generation

    try {
      // Use the states from App.tsx for the service call
      const result = await generateInstagramContent(topic, image, selectedCaptionStyle, selectedCaptionLength);
      setAllGeneratedCaptions(result.captions); // Set the first batch of captions
      setCurrentHashtags(result.hashtags);       // Set the hashtags
    } catch (err) {
      console.error("Error during initial generation:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during initial generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, image, selectedCaptionStyle, selectedCaptionLength]); // Dependencies for useCallback


  // --- NEW FUNCTION: handleLoadMore for appending captions ---
  const handleLoadMore = useCallback(async () => {
    // Ensure we have a topic or image to generate more from
    if (!topic && !image) {
      setError('Cannot load more content without a topic or image.');
      return;
    }
    setIsLoading(true); // Show loading spinner for "Load More" button
    setError(null); // Clear any previous error

    try {
      // Call the service with existing topic, image, and the currently selected style/length
      const result = await generateInstagramContent(topic, image, selectedCaptionStyle, selectedCaptionLength);
      // IMPORTANT: APPEND new captions to the existing list
      setAllGeneratedCaptions(prevCaptions => [...prevCaptions, ...result.captions]);
      // Hashtags usually don't need to be regenerated/appended for "Load More" unless explicitly desired
      // If you want to append/merge unique hashtags:
      // setCurrentHashtags(prevHashtags => [...new Set([...prevHashtags, ...result.hashtags])]);
    } catch (err) {
      console.error("Error during 'Load More' generation:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while loading more. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, image, selectedCaptionStyle, selectedCaptionLength]); // Dependencies for useCallback
  // --- END NEW FUNCTION ---


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        <main>
          {/* InputForm now receives captionStyle/Length states and setters as props */}
          <InputForm
            topic={topic}
            setTopic={setTopic}
            image={image}
            setImage={setImage}
            // Pass the state and setters down to InputForm to control its radio buttons
            captionStyle={selectedCaptionStyle} // <-- NEW PROP
            setCaptionStyle={setSelectedCaptionStyle} // <-- NEW PROP
            captionLength={selectedCaptionLength} // <-- NEW PROP
            setCaptionLength={setSelectedCaptionLength} // <-- NEW PROP
            onGenerate={handleGenerate} // This now directly calls App's handleGenerate
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Show spinner if either initial or "load more" is in progress */}
          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-indigo-300">AI is thinking...</p>
            </div>
          )}

          {/* Render ResultsDisplay only if there are captions and not loading */}
          {allGeneratedCaptions.length > 0 && !isLoading && !error ? (
            <ResultsDisplay
              content={{ captions: allGeneratedCaptions, hashtags: currentHashtags }} // Pass all captions and current hashtags
              onLoadMore={handleLoadMore} // Pass the new handler
              isLoadingMore={isLoading} // Pass loading state for the button
            />
          ) : (
            // Show IntroSection only if nothing is generated, not loading, and no error
            !isLoading && !error && allGeneratedCaptions.length === 0 && <IntroSection />
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;

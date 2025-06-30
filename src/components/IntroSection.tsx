import React from 'react';

const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-purple-300 mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

export const IntroSection: React.FC = () => {
    return (
        <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">Ready to Elevate Your Instagram?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Just describe your post or upload a photo, and our AI will handle the rest, crafting captivating captions and finding the perfect hashtags to match.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
                <FeatureCard 
                    title="Content-Aware Captions"
                    description="Get captions that perfectly match the mood and subject of your photo. The AI analyzes your image for context."
                />
                 <FeatureCard 
                    title="Smart Hashtag Generation"
                    description="Boost your reach with a mix of popular and niche hashtags, all relevant to your post's topic."
                />
            </div>
        </div>
    );
};
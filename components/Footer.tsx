import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center mt-12 py-4 border-t border-gray-700">
      <p className="text-gray-500">
        Made with 💕 in INDIA.
        {/* NEW: Privacy Policy Link */}
        <span className="mx-2 text-gray-700">|</span> {/* Separator */}
        <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
          Privacy Policy
        </a>
      </p>
    </footer>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto my-16 md:my-28 p-8 text-center space-y-6 fade-in">
      <div className="flex justify-center text-brand-ink">
        <Compass className="w-16 h-16 stroke-[1.25] animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-ink">Page not found</h1>
        <p className="text-brand-body text-sm font-normal leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-brand-black text-brand-white text-sm font-medium rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition duration-150 inline-block"
      >
        Go to home
      </button>
    </div>
  );
}

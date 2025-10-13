'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're in a GitHub Pages environment with BestHire base path
    if (typeof window !== 'undefined') {
      const isGitHubPages = window.location.hostname.includes('github.io');
      
      if (isGitHubPages) {
        const currentPath = window.location.pathname;
        
        // If the URL doesn't include the base path /BestHire, redirect to it
        if (!currentPath.includes('/BestHire')) {
          window.location.href = '/BestHire' + currentPath;
          return;
        }
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">404</h1>
      <h2 className="text-xl md:text-2xl mb-6">This page could not be found</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you were looking for does not exist or may have been moved.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/"
          className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition"
        >
          Go Home
        </Link>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
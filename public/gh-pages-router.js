// This script helps with GitHub Pages routing for Next.js static export
// It should be executed before the app loads to handle navigation properly

(function() {
    // Only run this in production GitHub Pages environment
    if (typeof window !== 'undefined' &&
        window.location.hostname.includes('github.io') &&
        !window.location.pathname.startsWith('/BestHire')) {

        // Save the original path (removing any potential duplicate slashes)
        const originalPath = window.location.pathname.replace(/\/+/g, '/');

        // Redirect to the correct path with the basePath
        window.location.href = '/BestHire' + (originalPath === '/' ? '' : originalPath);
    }
})();
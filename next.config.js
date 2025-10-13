/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    basePath: '/BestHire',
    assetPrefix: '/BestHire/',
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                canvas: false,
            };
        }

        // Ignore canvas module for pdfjs-dist
        config.resolve.alias = {
            ...config.resolve.alias,
            canvas: false,
        };

        // Mark canvas as external
        config.externals = config.externals || [];
        config.externals.push({
            canvas: 'canvas',
        });

        return config;
    },
}

module.exports = nextConfig
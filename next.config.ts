import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure webpack to handle Node.js modules
  webpack: (config, { isServer }) => {
    // Handle Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // Exclude firebase-admin from client-side bundle
      'firebase-admin': !isServer ? false : 'firebase-admin',
      'firebase-admin/auth': false,
      // Handle handlebars and other Node.js modules
      handlebars: false,
      fs: false,
      net: false,
      tls: false,
      dns: 'mock',
    };
    return config;
  },

  // Configure images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

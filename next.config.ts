
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Generate a static export of the app
  output: 'export',
  
  // Required for next/image to work with static exports
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

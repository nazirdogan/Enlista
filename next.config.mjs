/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      {
        source: '/auth/signup',
        destination: '/auth?tab=signup',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

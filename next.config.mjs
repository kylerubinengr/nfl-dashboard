/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
      },
    ],
  },
  transpilePackages: ['msw', '@mswjs/interceptors', 'until-async', '@open-draft/until', 'strict-event-emitter'],
};

export default nextConfig;

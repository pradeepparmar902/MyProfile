/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;

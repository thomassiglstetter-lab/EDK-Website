/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/news/:file(.+\\.(?:png|jpg|jpeg|webp|svg|gif|avif))",
        destination: "/uploads/news/:file",
      },
      {
        source: "/teams/:file(.+\\.(?:png|jpg|jpeg|webp|svg|gif|avif))",
        destination: "/uploads/teams/:file",
      },
      {
        source: "/sponsors/:file(.+\\.(?:png|jpg|jpeg|webp|svg|gif|avif))",
        destination: "/uploads/sponsors/:file",
      },
    ];
  },
};

export default nextConfig;

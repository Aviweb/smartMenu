/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@smartmenu/db"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

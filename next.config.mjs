/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ["192.168.101.9:3000", "192.168.101.9:3001"]
  }
};

export default nextConfig;

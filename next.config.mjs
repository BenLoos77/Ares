/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 15: serverActions sind stabil, Config entfällt
  // Prisma mit Next serverless
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;

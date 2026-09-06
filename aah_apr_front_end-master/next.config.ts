import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiUrl = apiBaseUrl ? new URL(apiBaseUrl) : null;

const nextConfig: NextConfig = {
  typedRoutes: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      ...(apiUrl
        ? [
            {
              protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
              hostname: apiUrl.hostname,
              port: apiUrl.port,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

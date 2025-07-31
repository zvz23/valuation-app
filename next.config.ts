import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    domains: ['aap356-my.sharepoint.com'], 
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // X-Frame-Options to prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options to prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Strict Transport Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''};
              style-src 'self' 'unsafe-inline' fonts.googleapis.com;
              img-src 'self' data: blob: https:;
              font-src 'self' fonts.gstatic.com;
              connect-src 'self' ${process.env.NODE_ENV === 'development' ? 'ws: wss:' : ''} https://*.sharepoint.com https://*.microsoftonline.com;
              frame-ancestors 'none';
              base-uri 'self';
              form-action 'self';
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
 
  // External packages for server components
  serverExternalPackages: ['bcryptjs', 'winax'],
  
  // Webpack configuration for native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude native modules from bundling
      config.externals = config.externals || [];
      config.externals.push('winax');
    }
    return config;
  },
  
  // Disable X-Powered-By header
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Generate ETag for caching
  generateEtags: true,
  
  // Development specific settings
  ...(process.env.NODE_ENV === 'development' && {
    // Only in development
    reactStrictMode: true,
  }),
  
  // Production specific settings
  ...(process.env.NODE_ENV === 'production' && {
    // Only in production
    reactStrictMode: true,
    // Enable compression
    compress: true,
  }),
};

export default nextConfig;

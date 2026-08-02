/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle for easy self-hosting on a VPS
  // (copy .next/standalone + .next/static + public and run `node server.js`).
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            // The app uses camera + microphone for LiveKit calls.
            value: 'camera=(self), microphone=(self), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig

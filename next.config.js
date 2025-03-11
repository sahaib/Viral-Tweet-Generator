/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
      };

      config.plugins = [
        ...config.plugins,
        new (require('webpack').ProvidePlugin)({
          process: 'process/browser',
        }),
      ];
    }
    return config;
  },
};

module.exports = nextConfig;

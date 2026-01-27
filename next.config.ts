const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['@'] = path.join(__dirname, './');
    return config;
  },
  env: {
    PROJECT_OPENAI_API_KEY: process.env.PROJECT_OPENAI_API_KEY,
    PROJECT_ANTHROPIC_API_KEY: process.env.PROJECT_ANTHROPIC_API_KEY,
  },
  turbopack: {},
};

module.exports = nextConfig;

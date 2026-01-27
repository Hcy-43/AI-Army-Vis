import path from 'path';
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack: (
    config: Configuration,
    options: {
      buildId: string;
      dev: boolean;
      isServer: boolean;
      defaultLoaders: {
        babel: any;
      };
      webpack: any;
    }
  ): Configuration => {
    config.resolve.alias['@'] = path.join(__dirname, './');
    return config;
  },
  env: {
    PROJECT_OPENAI_API_KEY: process.env.PROJECT_OPENAI_API_KEY,
    PROJECT_ANTHROPIC_API_KEY: process.env.PROJECT_ANTHROPIC_API_KEY,
  },
  turbopack: {},
};

export default nextConfig;

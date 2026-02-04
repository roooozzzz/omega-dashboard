import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境优化
  reactStrictMode: true,
  
  // 输出配置（Vercel 默认使用 standalone 无需显式配置）
  // output: 'standalone',
  
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.yahoo.com',
      },
    ],
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
  },
  
  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // 生产环境压缩
  compress: true,
  
  // 构建时生成源码映射（便于调试）
  productionBrowserSourceMaps: false,
};

export default nextConfig;

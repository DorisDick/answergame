/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // 为 GitHub Pages 静态托管启用导出
  output: "export",
  // GitHub Pages 子路径，如 /<repo>
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  // 避免 Next Image 远程优化在静态模式下的问题
  images: {
    unoptimized: true,
  },
  // 生成以斜杠结尾的路径，匹配 Pages 的静态托管习惯
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...(config.resolve?.fallback ?? {}),
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;



/** @type {import('next').NextConfig} */
const nextConfig = {
    // 在这里添加你的配置
    eslint: {
      // 这一行是关键，它会在生产构建时禁用 ESLint 检查
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;
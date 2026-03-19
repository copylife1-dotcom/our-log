import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // 형님의 폰(192.168.45.199)에서 오는 접속을 화끈하게 허용합니다.
    allowedDevOrigins: ["192.168.45.199", "localhost:3000"]
  }
};

export default nextConfig;
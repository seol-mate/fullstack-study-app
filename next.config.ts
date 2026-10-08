import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Docker 이미지 빌드에서만 켠다(Dockerfile이 NEXT_OUTPUT=standalone 설정). 로컬/CI 빌드는 기본 출력 유지.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;

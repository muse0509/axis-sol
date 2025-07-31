import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ⬇︎ トップレベル。プロトコル無しの「ホスト名」だけを書く
  allowedDevOrigins: [
    '0351cfe3887d.ngrok-free.app',
  ],

  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // fs モジュールをクライアント側で解決しない
      config.resolve ??= {};
      config.resolve.fallback ??= {};
      config.resolve.fallback.fs = false;
    }
    return config;
  },
}

export default nextConfig

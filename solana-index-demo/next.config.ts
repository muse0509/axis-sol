/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // `fs`モジュールをサーバーサイドでのみ有効にする
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    // Solanaのライブラリが必要とするNode.jsのコアモジュールを
    // ブラウザで動作するように設定する
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      buffer: require.resolve('buffer/'),
    };

    // Bufferをグローバルに利用可能にするための設定
    config.plugins.push(
      new (require('webpack').ProvidePlugin)({
        Buffer: ['buffer', 'Buffer'],
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;
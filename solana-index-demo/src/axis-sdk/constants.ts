// constants.ts (Meteora対応版)

import { PublicKey } from '@solana/web3.js';

// --- 主役トークン ---
// 私たちがsugarで作成したメタデータ付きのIndex Token
export const INDEX_TOKEN_MINT_ADDRESS = new PublicKey('ByThBJkZGa9eCXjyyubHUSpK9oqG2A3QyYt5zcAdF7N5');

// --- 基準となるトークン ---
// DevnetのUSDC
export const USDC_MINT_ADDRESS = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');


// --- Meteora DLMM関連 ---
export const DLMM_PROGRAM_ID = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');

// TODO: あなたが作成/利用する10個のMeteoraプールアドレスをここに設定してください
// (MeteoraのUIで作成したプールのページURLや、ご自身のウォレットのトランザクション履歴から確認できます)
export const METEORA_POOL_ADDRESSES = [
  new PublicKey('5kmcJMSZxsmBij3eLmnUXbxaqN7GfnUw8Wz8F3UXgyaK'),  // 例: MeteoraでSOL/USDCペアを探し、そのプールアドレスを貼る
  new PublicKey('65ENujosfe8WBvnBFkpKv5kzJFN523VDkiu9wXDmUbax'),  // 例: MeteoraでBTC/USDCペアを探し、そのプールアドレスを貼る
  new PublicKey('7avBCTAqAg39j31oA9qBsy1Gp4emADeGNfsfgMPDdWER'),  // 例: MeteoraでETH/USDCペアを探し、そのプールアドレスを貼る
  new PublicKey('4NUJ4yErNN6sZKTXKmHyMh37tUvL6m3PZjB4xTYmmUdv'),
  new PublicKey('6a8WG1zECEQrbAh1rDK3N1i3mw3ANbffWbwkqEHwsSWD'),
  new PublicKey('GZiyzXLnQ239NSWo4p7grZb5fiiSeyWoDtrCoZfeP5UT'),
  new PublicKey('uZEh8D7C4andH2cKmzGZzvJepLCK9ds74AUBdFjPwX6'),
  new PublicKey('7zmxQABCZMZGRPoWQzBQBhrP1c6UniTPyCJ53Z7AcR9Q'),
  new PublicKey('EgiTMGEukr4TthnT33PTbBkwZk6FKr41nTRLHhQcbv8R'),
  new PublicKey('A3TmrBAUpajsrco3UQVMJZvSxLMLPsaQUg24kHGMVRW'),
];
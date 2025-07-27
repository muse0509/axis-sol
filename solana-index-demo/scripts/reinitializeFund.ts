import { AnchorProvider, Program, web3, BN, Wallet, AnchorError } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import * as fs from 'fs';
import os from 'os';

// 修正①: 型定義を`target/types`からインポート
import { IDL as RAW_IDL, type AxisIndex } from './idl/axis_index'

// --- 設定項目 ---
const ADMIN_KEYPAIR_PATH = os.homedir() + '/.config/solana/id.json';
const PROGRAM_ID = new PublicKey('9tBJstf7q2MZXSmSECCLoXV5YMaEpQHNfWLwT33MLzdg');
const USDC_MINT  = new PublicKey('2Xos1H2fh1GFgmfUq968JnFS8B47G1Uqa8gFUs4a2F43');
const WSOL_MINT  = new PublicKey('So11111111111111111111111111111111111111112');

// --- ここからメインロジック ---

async function main() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const secretKey = JSON.parse(fs.readFileSync(ADMIN_KEYPAIR_PATH, 'utf-8'));
  const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

  // 修正②: KeypairをWalletオブジェクトでラップする
  const wallet = new Wallet(adminKeypair);

  // Providerを新しいWalletオブジェクトで初期化
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });

  // 修正③: Programオブジェクトの推奨される初期化方法
  // IDLにプログラムIDを設定してからProgramをインスタンス化する
  const idlAny: any = JSON.parse(JSON.stringify(RAW_IDL));
  idlAny.address = PROGRAM_ID.toBase58();
  const program = new Program<AxisIndex>(idlAny, provider);

  console.log(`- Admin Wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`- Program ID:   ${program.programId.toBase58()}`);
  console.log(`- USDC Mint:    ${USDC_MINT.toBase58()}`);

  const indexMint = Keypair.generate();
  console.log(`- New Index Mint: ${indexMint.publicKey.toBase58()}`);

  const constituents = [
    { tokenMint: USDC_MINT, targetBps: 5000, pythPriceAcc: new PublicKey('5SSkXsEKQepHHAewytPVwvr4x_A9M4tVTiePTS8Cj29') },
    { tokenMint: WSOL_MINT, targetBps: 5000, pythPriceAcc: new PublicKey('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBAPPlxn5m3') }
  ];

  console.log("\n--- Correct Constituent Data ---");
  console.log(`[0] USDC Pyth: ${constituents[0].pythPriceAcc.toBase58()}`);
  console.log(`[1] SOL Pyth:  ${constituents[1].pythPriceAcc.toBase58()}`);
  console.log("--------------------------------\n");

  try {
    const tx = await program.methods
      .initializeFund(constituents, new BN(86400))
      .accounts({
        admin: wallet.publicKey,
        indexMint: indexMint.publicKey,
        usdcMint: USDC_MINT,
      })
      .signers([adminKeypair, indexMint])
      .rpc();

    console.log("✅ Fund re-initialized successfully!");
    console.log(`Transaction Signature: ${tx}`);

  } catch (err) {
    console.error("❌ Failed to re-initialize fund:", err);
    // 修正④: 正しいエラーハンドリング
    if (err instanceof AnchorError) {
      console.error(`\nAnchorError: ${err.error.errorMessage}`);
      console.error(`Error Code: ${err.error.errorCode.code} (#${err.error.errorCode.number})`);
      console.log(`\nLogs:\n${err.logs?.join('\n')}`);
    }
  }
}

main().then(
  () => process.exit(0),
  err => {
    console.error(err);
    process.exit(1);
  }
);
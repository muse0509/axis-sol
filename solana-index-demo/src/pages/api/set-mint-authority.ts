import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  getMint,
  setAuthority,
  AuthorityType,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'
import { loadTreasurySigner } from '@/lib/loadSigner'

/**
 * 現 mintAuthority の秘密鍵で署名して実行してください（= サーバの signer が現 authority）。
 * Body: { mint: string, newAuthority: string, alsoMoveFreeze?: boolean }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end()
    const { mint, newAuthority, alsoMoveFreeze } =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!mint || !newAuthority) throw new Error('mint / newAuthority are required')

    const connection = new Connection(process.env.RPC_URL!, 'confirmed') // Devnet RPC を設定
    const signer     = loadTreasurySigner() // ← 現 mintAuthority の鍵であること

    const mintPk     = new PublicKey(mint)
    const newAuthPk  = new PublicKey(newAuthority)

    // 1) ミント口座の owner を確認（Token か Token-2022 か）
    const accInfo = await connection.getAccountInfo(mintPk, 'confirmed')
    if (!accInfo) throw new Error('mint not found on this cluster')
    const PROGRAM_ID = accInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID
    // ↑ Token / Token-2022 は spl-token の API で programId を渡すだけで両対応です。:contentReference[oaicite:1]{index=1}

    // 2) 現在の mintAuthority / freezeAuthority を取得（オンチェーン情報が唯一の真実）
    const info = await getMint(connection, mintPk, 'confirmed', PROGRAM_ID) // decimals / authorities 取得
    // getMint はミントの供給量や権限・decimals を返す公式 API。:contentReference[oaicite:2]{index=2}

    if (!info.mintAuthority) {
      // mintAuthority が null の場合、そのミントは固定供給で増刷不可（再有効化できません）
      // → 新ミントを作る以外に方法はありません。
      throw new Error('mintAuthority is None (fixed supply). Cannot set or mint.')
    }
    if (!info.mintAuthority.equals(signer.publicKey)) {
      // サーバ signer が現 authority でなければ、setAuthority は失敗します（OwnerMismatch = 0x4）
      throw new Error(
        `Wrong signer. Current mintAuthority is ${info.mintAuthority.toBase58()}`
      )
    }

    // 3) MintTokens の権限を newAuthority へ移譲
    const sig1 = await setAuthority(
      connection,
      signer,                // 手数料支払い & 署名者
      mintPk,                // 対象（ミント）
      signer.publicKey,      // 現 mintAuthority
      AuthorityType.MintTokens, // ← Mint 権限
      newAuthPk,             // 新しい権限先
      [],                    // multisig なし
      undefined,             // confirmOptions
      PROGRAM_ID,            // Token or Token-2022
    )
    // setAuthority の関数仕様は spl-token の TS docs を参照。:contentReference[oaicite:3]{index=3}

    let sig2: string | null = null
    if (alsoMoveFreeze && info.freezeAuthority?.equals(signer.publicKey)) {
      // Freeze 権限も同時に移譲したい場合（任意）
      sig2 = await setAuthority(
        connection,
        signer,
        mintPk,
        signer.publicKey,
        AuthorityType.FreezeAccount,
        newAuthPk,
        [],
        undefined,
        PROGRAM_ID,
      )
    }

    return res.status(200).json({
      ok: true,
      programId: PROGRAM_ID.toBase58(),
      fromAuthority: signer.publicKey.toBase58(),
      toAuthority: newAuthPk.toBase58(),
      signatures: [sig1, sig2].filter(Boolean),
    })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection, PublicKey } from '@solana/web3.js'
import { getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mint = new PublicKey(String(req.query.mint))
    const connection = new Connection(process.env.RPC_URL!, 'confirmed')
    const acc = await connection.getAccountInfo(mint, 'confirmed')
    if (!acc) throw new Error('mint not found')
    const programId = acc.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    const info = await getMint(connection, mint, 'confirmed', programId)
    res.status(200).json({
      programId: programId.toBase58(),
      decimals: info.decimals,
      mintAuthority: info.mintAuthority?.toBase58() ?? null,
      freezeAuthority: info.freezeAuthority?.toBase58() ?? null,
      supply: info.supply.toString(),
    })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'internal error' })
  }
}

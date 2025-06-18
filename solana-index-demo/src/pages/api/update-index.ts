import { NextApiRequest, NextApiResponse } from 'next';
import { runIndexUpdateJob } from '../../lib/jobs/updateIndex';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --------------------------------------------------
  // 開発を円滑にするため、一時的に認証チェックをコメントアウトします。
  // 本番環境にデプロイする前、特にCronジョブを設定する際には、
  // この認証を必ず元に戻してください。
  /*
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  */
  // --------------------------------------------------

  if (req.method === 'POST' || req.method === 'GET') { // GETリクエストでもテストできるように変更
    try {
      console.log('API endpoint /api/update-index called.');
      const result = await runIndexUpdateJob();
      
      if (result.success) {
        res.status(200).json({ message: 'Index update job completed successfully.', data: result.data });
      } else {
        // エラーが発生した場合も、エラー内容がわかるように200で返し、フロントでのハンドリングを容易にすることもできます
        // ここではサーバーエラーとして500を返します
        res.status(500).json({ message: 'Index update job failed.', error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ message: 'An unexpected error occurred in the API handler.', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    'auth_token=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;'
  );
  res.status(200).json({ success: true });
}

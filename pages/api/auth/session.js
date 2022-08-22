import { getSession } from '../../../lib/auth/server';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const session = await getSession({ req, res });
        res.status(200).json({ session });
        return;
    }

    res.status(405).json({ message: 'Only GET requests are allowed!' });
}

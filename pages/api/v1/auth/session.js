import { COOKIES } from '../../../../lib/auth/client';
import { getSession } from '../../../../lib/auth/server';

export default async function handler(req, res) {
	let message; let session; let cookies = [];
	if (req.method === 'GET') {
		session = await getSession({ req, res });
		if (!session) {
			const now = new Date();
			cookies = Object.keys(COOKIES)
				.map(key => (`${COOKIES[key]}=;path=/;expires=${now};`));
		}
		res.status(200).setHeader('Set-Cookie', cookies).json(session);
		return;
	}

	message = 'Only GET requests are allowed!';
	res.status(405).send(message);
}

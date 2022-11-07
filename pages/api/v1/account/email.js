import { getSession } from '../../../../lib/auth/server';
import { connect } from '../../../../lib/database';
import jwt from 'jsonwebtoken';
import path from 'path';
import md5 from 'md5';
import fs from 'fs';

export default async function handler(req, res) {
	let message; let client; let user;

	if (req.method === 'PUT') {

		const { emailHash, email, encryptedEmail } = req.body;

		const { token } = await getSession({ req, res });

		if (!token) {
			message = 'Unauthorized!';
			res.status(401).send(message);
			return;
		}

		if (!email || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
			.test(email)) {
			message = 'The provided e-mail address was invalid!';
			res.status(400).send(message);
			return;
		}

		if (!encryptedEmail || encryptedEmail.trim() === '') {
			message = 'The provided encrypted e-mail was invalid!';
			res.status(400).send(message);
			return;
		}

		const newEmailHash = md5(email);

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}

		try {
			user = await client.db().collection('users').findOne({ emailHash });
		} catch (error){
			message = 'Failed to fetch users from the collection, try again later!';
			res.status(500).send(message);
			return;
		}

		if (!user) {
			message = 'There is no user with the provided e-mail address!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		user.emailHash = newEmailHash;

		user.encryptedEmail = encryptedEmail;

		try {
			await client.db().collection('users').updateOne({
				_id: user._id
			}, { $set: {
				encryptedEmail,
				emailHash: newEmailHash
			}});
		} catch (error) {
			message = 'Failed to update the e-mail address for the user!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		const payload = {
			emailHash: newEmailHash,
			identityNumberHash: user.identityNumberHash,
			iat: Date.now(),
			exp: Math.floor(Date.now() / 1000) + (60 * 60)
		};

		const key = fs.readFileSync(path.join(process.cwd(), 'key.key'));

		const _token = await (() => {
			return new Promise((resolve, _) => {
				jwt.sign(payload, key, { algorithm: 'RS256' }, (error, token) => {
					if (!error) resolve(token);
					resolve(null);
				});
			});
		})();

		if (!_token) {
			message = 'Failed to sign the token, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		const cookies = [
			'auth.token=' + _token + ';path=/;',
			'auth.encrypted-email=' + encryptedEmail + ';path=/;'
		];

		res.status(204).setHeader('Set-Cookie', cookies).send();
		await client.close();
		return;
	}

	message = 'Only PUT requests are allowed!';
	res.status(405).send(message);
}

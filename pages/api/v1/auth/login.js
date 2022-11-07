import { connect } from '../../../../lib/database';
import jwt from 'jsonwebtoken';
import path from 'path'
import md5 from 'md5'
import fs from 'fs';

export default async function handler(req, res) {
	let message; let client; let user;

	if (req.method === 'POST') {

		const { email, passwordHash } = req.body;

		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
			message = 'The request did not contain a valid e-mail address!';
			res.status(400).send(message);
			return;
		}

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}

		const emailHash = md5(email);

		try {
			user = await client.db().collection('users').findOne({emailHash});
		} catch (error) {
			message = 'Failed to fetch users from the collection, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		if (!user) {
			message = 'There is no user with the provided e-mail address!';
			res.status(400).send(message)
			await client.close();
			return;
		}

		if (passwordHash !== user.passwordHash) {
			message = 'Unauthorized!';
			res.status(401).send(message);
			await client.close();
			return;
		}

		const key = fs.readFileSync(path.join(process.cwd(), 'key.key'));

		const payload = {
			postalCode: user.postalCode,
			iat: Date.now(),
			exp: Math.floor(Date.now() / 1000) + (60 * 60)
		};

		const token = await (async () => {
			return new Promise((resolve, _) => {
				jwt.sign(payload, key, { algorithm: 'RS256' }, (error, token) => {
					if (!error) resolve(token);
					resolve(null);
				});
			});
		})();

		const cookies = [
			'auth.token=' + token + ';path=/;',
			'auth.encrypted-identity-number=' + user.encryptedIdentityNumber + ';path=/;',
			'auth.encrypted-email=' + user.encryptedEmail + ';path=/;',
			'auth.encrypted-first-name=' + user.encryptedFirstName + ';path=/;',
			'auth.encrypted-last-name=' + user.encryptedLastName + ';path=/;',
			'auth.encrypted-private-key-pem=' + user.encryptedPrivateKeyPem + ';path=/;',
			'auth.postal-code=' + user.postalCode + ';path=/;'
		];

		message = 'You successfully logged in!';
		res.status(200).setHeader('Set-Cookie', cookies).send(message);
		await client.close();
		return;
	}

	message = 'Only POST requests are allowed!';
	res.status(405).send(message);
}

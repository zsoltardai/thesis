import { connect, find } from '../../../lib/db/mongodb-util';
import jwt from 'jsonwebtoken';
import path from 'path'
import md5 from 'md5'
import fs from 'fs';

export default async function handler(req, res) {
	if (req.method === 'POST') {

		const { email, passwordHash } = req.body;

		if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
			.test(email)) {
			res.status(400)
				.json({
					message: 'The request did not contain a valid e-mail address!'
				});
			return;
		}

		const emailHash = md5(email);

		let client;

		try {
			client = await connect();
		} catch (error) {
			res.status(500)
				.json({
					message: 'Failed to connect to the database, try again later.'
				});
			return;
		}

		let user;

		try {
			const users = await find(client, 'users', {
				emailHash: emailHash
			});
			user = users[0];
		} catch (error) {
			res.status(500)
				.json({
					message: 'Failed to fetch users from the collection, try again later.'
				});
			await client.close();
			return;
		}

		if (!user) {
			res.status(400)
				.json({
					message: 'There is no user with the provided e-mail address!'
				})
			await client.close();
			return;
		}

		if (passwordHash !== user.passwordHash) {
			res.status(401).json({
				message: 'Unauthorized.'
			});
			await client.close();
			return;
		}

		const key = fs.readFileSync(path.join(process.cwd(), 'key.key'));

		const payload = {
			emailHash: emailHash,
			identityNumberHash: user.identityNumberHash,
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

		/*
		const session = {
			token: token,
			user: {
				encryptedIdentityNumber: user.encryptedIdentityNumber,
				encryptedEmail: user.encryptedEmail,
				encryptedFirstName: user.encryptedFirstName,
				encryptedLastName: user.encryptedLastName,
				encryptedPrivateKeyPem: user.encryptedPrivateKeyPem
			}
		};
		*/
		
		const cookies = [
			'auth.token=' + token + ';path=/;',
			'auth.encrypted-identity-number=' + user.encryptedIdentityNumber + ';path=/;',
			'auth.encrypted-email=' + user.encryptedEmail + ';path=/;',
			'auth.encrypted-first-name=' + user.encryptedFirstName + ';path=/;',
			'auth.encrypted-last-name=' + user.encryptedLastName + ';path=/;',
			'auth.encrypted-private-key-pem=' + user.encryptedPrivateKeyPem + ';path=/;'
		];

		res.status(200)
			.setHeader('Set-Cookie', cookies)
			.json({
				message: 'You successfully logged in!'
			});
		await client.close();
		return;
	}

	res.status(405)
		.json({
			message: 'Only POST requests are allowed!'
		});
}

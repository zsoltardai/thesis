import md5 from 'md5';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { connect, find, update } from '../../../lib/db/mongodb-util';
import { getSession } from '../../../lib/auth/server';

export default async function handler(req, res) {
	if (req.method === 'PUT') {

		const { email, encryptedEmail } = req.body;

		const { token } = await getSession({
			req,
			res
		});

		if (!token) {
			res.status(401)
				.json({
					message: 'Unauthorized.'
				});
			return;
		}

		const { emailHash } = token;

		if (!email || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
			.test(email)) {
			res.status(400)
				.json({
					message: 'The provided e-mail address was invalid!'
				});
			return;
		}

		if (!encryptedEmail || encryptedEmail.trim() === '') {
			res.status(400)
				.json({
					message: 'The provided encrypted e-mail was invalid!'
				});
			return;
		}

		const newEmailHash = md5(email);

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
		} catch (error){
			res.status(500)
				.json({
					message: 'Failed to fetch users from the collection.'
				});
		}

		if (!user) {
			res.status(404)
				.json({
					message: 'There is no user with the provided e-mail address!'
				});
			await client.close();
			return;
		}

		user.emailHash = newEmailHash;

		user.encryptedEmail = encryptedEmail;

		try {
			await update(client, 'users', user._id, {
				encryptedEmail: encryptedEmail,
				emailHash: newEmailHash
			});
		} catch (error) {
			res.status(500)
				.json({
					message: 'Failed to update the e-mail address for the user!'
				});
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
			res.status(500)
				.json({
					message: 'Failed to sign the token, try again later.'
				});
			await client.close();
			return;
		}

		const cookies = [
			'auth.token=' + _token + ';path=/;',
			'auth.encrypted-email=' + encryptedEmail + ';path=/;'
		];

		res.status(204)
			.setHeader('Set-Cookie', cookies)
			.send();
		await client.close();
		return;
	}

	res.status(405)
		.json({
			message: 'Only PUT requests are allowed!'
		});
}

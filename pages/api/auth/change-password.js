import { connect, find, update } from '../../../lib/db/mongodb-util';
import { getSession } from '../../../lib/auth/server';

export default async function handler(req, res) {
	if (req.method === 'PUT') {

		const { currentPasswordHash, newPasswordHash, encryptedPrivateKeyPem } = req.body;

		const { token, _ } = await getSession({
			req: req,
			res: res
		});

		const { emailHash } = token;

		if (!token) {
			res.status(401)
				.json({
					message: 'Unauthorized.'
				});
			return;
		}

		if (!currentPasswordHash || currentPasswordHash.trim() === '') {
			res.status(400)
				.json({
					message: 'The provided current password hash was empty!'
				});
			return;
		}

		if (!newPasswordHash || newPasswordHash.trim() === '') {
			res.status(400)
				.json({
					message: 'The provided new password hash was empty!'
				});
			return;
		}

		if (!encryptedPrivateKeyPem || encryptedPrivateKeyPem.trim() === '') {
			res.status(400)
				.json({
					message: 'The provided encrypted private key pem was empty!'
				});
			return;
		}

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
					message: 'Failed to fetch documents from the collection.'
				});
			await client.close();
			return;
		}

		if (!user) {
			res.status(404)
				.json({
					message: 'There is no user with the provided email hash.'
				});
			await client.close();
			return;
		}

		if (currentPasswordHash !== user.passwordHash) {
			res.status(401)
				.json({
					message: 'Unauthorized.'
				});
			await client.close();
			return;
		}

		user.encryptedPrivateKeyPem = encryptedPrivateKeyPem;

		user.passwordHash = newPasswordHash;

		try {
			await update(client, 'users', user._id, {
				encryptedPrivateKeyPem: encryptedPrivateKeyPem,
				passwordHash: newPasswordHash
			});
		} catch (error) {
			res.status(500)
				.json({
					message: 'Failed to update the password of the user.'
				});
			await client.close();
			return;
		}

		const cookies = [
			'auth.encrypted-private-key-pem=' + encryptedPrivateKeyPem + ';path=/;',
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

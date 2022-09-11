import { getSession } from '../../../../lib/auth/server';
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
	let message; let client; let user;

	if (req.method === 'PUT') {

		const { currentPasswordHash, newPasswordHash, encryptedPrivateKeyPem } = req.body;

		const { token } = await getSession({ req, res });

		const { emailHash } = token;

		if (!token) {
			message = 'Unauthorized!';
			res.status(401).send(message);
			return;
		}

		if (!currentPasswordHash || currentPasswordHash.trim() === '') {
			message = 'The provided current password hash was empty!';
			res.status(400).send(message);
			return;
		}

		if (!newPasswordHash || newPasswordHash.trim() === '') {
			message = 'The provided new password hash was empty!';
			res.status(400).send(message);
			return;
		}

		if (!encryptedPrivateKeyPem || encryptedPrivateKeyPem.trim() === '') {
			message = 'The provided encrypted private key pem was empty!';
			res.status(400).send(message);
			return;
		}

		try {
			client = await MongoClient.connect(process.env.MONGODB);
		} catch (error) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}

		try {
			user = await client.db().collection('users').findOne({ emailHash });
		} catch (error) {
			message = 'Failed to fetch documents from the collection, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		if (!user) {
			message = 'There is no user with the provided email hash!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (currentPasswordHash !== user.passwordHash) {
			message = 'Unauthorized!';
			res.status(401).send(message);
			await client.close();
			return;
		}

		user.encryptedPrivateKeyPem = encryptedPrivateKeyPem;

		user.passwordHash = newPasswordHash;

		try {
			await client.db().collection('users').updateOne({
				_id: user._id
			}, { $set: {
				encryptedPrivateKeyPem,
				passwordHash: newPasswordHash
			}});
		} catch (error) {
			message = 'Failed to update the password of the user!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		const cookies = [
			'auth.encrypted-private-key-pem=' + encryptedPrivateKeyPem + ';path=/;',
		];

		res.status(204).setHeader('Set-Cookie', cookies).send();
		await client.close();
		return;
	}

	message = 'Only PUT requests are allowed!';
	res.status(405).send(message);
}

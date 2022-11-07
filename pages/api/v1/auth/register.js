import { connect } from '../../../../lib/database';
import md5 from 'md5';

export default async function handler(req, res) {
	let message; let client;

	if (req.method === 'POST') {

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}

		const {
			identityNumber,
			encryptedIdentityNumber,
			email,
			encryptedEmail,
			encryptedFirstName,
			encryptedLastName,
			encryptedPrivateKeyPem,
			passwordHash,
			registrationCodeHash,
			postalCode
		} = req.body;

		if (!identityNumber || !(/^[0-9]{6}[A-Z]{2}$/).test(identityNumber)) {
			message = 'The provided identity number is invalid!';
			res.status(400).send(message);
			return;
		}

		if (!email || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)) {
			message = 'The provided email address is invalid!';
			res.status(400).send(message);
			return;
		}

		if (!postalCode || !(/^[0-9]{4}$/).test(postalCode)) {
			message = 'The provided postal code is invalid!';
			res.status(400).send(message);
			return;
		}

		try {
			let exists = await client.db().collection('postalCodes').findOne({postalCode});

			if (exists) {
				message = 'The provided postal code does not exist!';
				res.status(400).send(message);
				return;
			}
		} catch (error) {
			message = 'Failed to fetch postal codes, try again later.!';
			res.status(500).send(message);
			return;
		}

		let code = null;

		try {
			code = await client.db().collection('codes').findOne({code: registrationCodeHash});

			if (!code) {
				message = 'The provided registration code was invalid!';
				res.status(400).send(message);
				await client.close();
				return;
			}
		} catch (error) {
			message = 'Failed to fetch codes from the collection, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		const identityNumberHash = md5(identityNumber);

		try {
			const user = await client.db().collection('users').findOne({identityNumberHash});

			if (user) {
				message = 'There is already a user with this identity number!';
				res.status(409).send(message);
				await client.close();
				return;
			}
		} catch (error) {
			message = 'Failed to fetch users from the users collection!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		const emailHash = md5(email);

		let user = {
			identityNumberHash,
			encryptedIdentityNumber,
			emailHash,
			encryptedEmail,
			encryptedFirstName,
			encryptedLastName,
			encryptedPrivateKeyPem,
			passwordHash,
			postalCode
		};

		user['_id'] = md5(JSON.stringify(user));

		try {
			await client.db().collection('users').insertOne(user);
		} catch(error) {
			message = 'Failed to create a new user, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		try {
			await client.db().collection('codes').deleteOne({_id: code._id});
		} catch (error) {
			message = 'Failed to delete the registration code from the collection, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		message = 'User created successfully!';
		res.status(201).send(message);
		await client.close();
		return;
	}

	message = 'Only POST requests are allowed!';
	res.status(405).send(message);
}

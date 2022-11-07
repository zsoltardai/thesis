import { validateRequestCredentials } from '../../../../lib/auth/server';
import { connect } from '../../../../lib/database';
import crypto from 'crypto';


export default async function handler(req, res) {
	let client; let message; let settlements;
	const ALLOWED = ['GET', 'POST'];

	if (ALLOWED.includes(req.method)) {
		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}
	}

	if (req.method === 'GET') {

		try {
			settlements = await client.db()
				.collection('settlements')
				.find()
				.toArray();
		} catch (error) {
			message = 'Failed to fetch postal codes from the database!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(200).json(settlements);
		await client.close();
		return;
	}

	if (req.method === 'POST') {

		if (!(await validateRequestCredentials({req, res}))) {
			await client.close();
			return;
		}

		if (!validateRequestBody({req, res})) {
			await client.close();
			return;
		}

		let { postalCode, settlement: _settlement } = req.body;

		const id = crypto.randomBytes(3 *4).toString('base64url');

		let settlement = {
			_id: id,
			postalCode: parseInt(postalCode),
			settlement: _settlement
		};

		try {
			const exists = await client.db()
				.collection('settlements')
				.findOne({
					postalCode
				});

			if (exists) {
				message = 'The provided postal code already exists!';
				res.status(409).send(message);
				await client.close();
				return;
			}

			await client.db()
				.collection('settlements')
				.insertOne({...settlement});
		} catch (error) {
			message = 'Failed to add the postal code to the collection!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(201).json(settlement);
		await client.close();
		return;
	}

	message = 'Only GET and POST requests are allowed!';
	res.status(405).send(message);
}


const validateRequestBody = (options) => {
	const { req, res } = options; let message;
	const { postalCode, settlement } = req.body;

	if (!postalCode || !(/^[0-9]{4}$/).test(postalCode)) {
		message = 'The provided postal code was invalid!';
		res.status(400).send(message);
		return false;
	}

	if (!settlement || settlement.trim() === '') {
		message = 'The provided settlement name was invalid!';
		res.status(400).send(message);
		return false;
	}

	return true;
}

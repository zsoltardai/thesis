import { validateRequestCredentials } from '../../../../lib/auth/server';
import { MongoClient } from 'mongodb';
import * as crypto from 'crypto';
import md5 from 'md5';


export default async function handler(req, res) {
	let client; let message;

	if (req.method === 'POST') {
		if (!(await validateRequestCredentials({req, res}))) return;

		let { code } = req.body;

		try {
			client = await MongoClient.connect(process.env.MONGODB);
		} catch (error) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}

		const id = crypto.randomBytes(16).toString('base64');
		const issued = new Date().toISOString();
		code = (!code) ? crypto.randomBytes(20).toString('base64') : code;

		try {
			await client.db()
				.collection('codes')
				.insertOne({
					_id: id,
					code: md5(code),
					issued: issued
				});
		} catch (error) {
			message = 'Failed to insert record to the database, try again later!';
			res.status(500).send(message);
			return;
		}

		res.status(201).send(code);
		return;
	}

	message = 'Only POST requests are allowed!';
	res.status(405).send(message);
}
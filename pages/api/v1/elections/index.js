import { MongoClient } from 'mongodb';
import * as crypto from 'crypto';
import md5 from 'md5';

export default async function handler(req, res) {
	let message; let client; let elections;
	let ALLOWED = ['GET', 'POST'];

	if (ALLOWED.includes(req.method)) {
		try {
			client = await MongoClient.connect(process.env.MONGODB);
		} catch (error) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}
	}

	if (req.method === 'GET') {

		try {
			elections = await client.db()
				.collection('elections')
				.find()
				.project({
					districts: 0,
					candidates: 0,
					partyLists: 0,
					votes: 0
				})
				.toArray();
		} catch (error) {
			message = 'Failed to fetch elections from the database, try again later!';
			res.status(500).send(message);
			return;
		}

		res.status(200).json(elections);
		await client.close();
		return;
	}

	if (req.method === 'POST') {

		const { name, registration, voting } = req.body;

		if (!validateRequestBody({ req, res })) {
			return;
		}

		const id = crypto.randomBytes(3*4).toString('base64');

		let election = {
			_id: id,
			name,
			registration,
			voting,
			districts: [],
			partyLists: [],
			candidates: [],
			votes: []
		};

		try {
			await client.db()
				.collection('elections')
				.insertOne(election);
		} catch (error) {
			message = 'Failed to insert document to the database, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}


		res.status(201).send();
		await client.close();
		return;
	}

	message = 'Only GET and POST requests are allowed!';
	res.status(405).send(message);
}

function validateRequestBody({ req, res }) {
	let message;
	const { name, registration, voting } = req.body;

	if (!name || name.trim() === '') {
		message = 'You did not provide a valid election name!';
		res.status(400).send(message);
		return false;
	}

	{
		const { start, end } = registration;
		if (!start || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/.test(start)) {
			message = 'You did not provide a valid registration start date!';
			res.status(400).send(message);
			return false;
		}
		if (!end || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/.test(end)) {
			message = 'You did not provide a valid registration end date!';
			res.status(400).send(message);
			return false;
		}
		if (new Date(start) > new Date(end)) {
			message = 'The registration process cannot end before it started!';
			res.status(400).send(message);
			return false;
		}
	}

	{
		const { start, end } = voting;
		if (!start || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/.test(start)) {
			message = 'You did not provide a valid voting start date!';
			res.status(400).send(message);
			return false;
		}
		if (!end || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/.test(end)) {
			message = 'You did not provide a valid voting end date!';
			res.status(400).send(message);
			return false;
		}
		if (new Date(start) > new Date(end)) {
			message = 'The voting process cannot end before it started!';
			res.status(400).send(message);
			return false;
		}
	}

	{
		const { start } = voting; const { end } = registration;
		if (new Date(start) < new Date(end)) {
			message = 'The voting process cannot start before the registration ends.';
			res.status(400).send(message);
			return false;
		}
	}

	return true;
}
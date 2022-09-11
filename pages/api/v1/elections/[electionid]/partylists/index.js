import { connect } from '../../../../../../lib/db/mongodb-util';

export default async function handler(req, res) {
	let message; let client; let election;
	const ALLOWED = ['GET', 'POST'];

	if (ALLOWED.includes(req.method)) {
		try {
			client = await connect();
		} catch (error) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}
	}

	const { electionid } = req.query;

	try {
		election = await client.db()
			.collection('elections')
			.findOne({ _id: electionid });
		res.status(200).json(election);
	} catch (error) {

	}

	if (req.method === 'GET') {

	}

	if (req.method === 'POST') {
	}

	message = 'Only GET and POST requests are allowed!';
	res.status(405).send(message);
	await client.close();
}

export function validateRequestBody({ req, res }) {
	let message;

	const { partyName, placeOnBallot, color, logo } = req.body;

	if (!partyName || partyName.trim() === '') {
		message = 'Your request did not contain a valid partyName!';
		res.status(400).send(message);
		return false;
	}

	if (!placeOnBallot || typeof placeOnBallot !== 'number') {
		message = 'Your request did not contain a valid placeOnBallot!';
		res.status(400).send(message);
		return false;
	}

	if (!color || !(/^#[A-Za-z0-9]{6}$/).test(color)) {
		message = 'Your request did not contain a valid color!';
		res.status(400).send(message);
		return false;
	}

	if (!logo || logo.trim() === '') {
		message = 'Your request did not contain a valid logo!';
		res.status(400).send(message);
		return false;
	}

	return true;
}

export async function electionExists(electionid, client) {
	try {
		const result = await client.select('elections', ['id'], { id: electionid });
		if (result.length === 0) return false;
	} catch (error) { return false; }
	return true;
}

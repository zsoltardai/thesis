import { validateRequestCredentials } from '../../../../../../lib/auth/server';
import { connect } from '../../../../../../lib/database';
import { findElectionById } from '../index';
import * as crypto from 'crypto';

export default async function handler(req, res) {
	let message; let client; let election;
	const ALLOWED = ['GET', 'POST'];

	const { electionid } = req.query;

	if (ALLOWED.includes(req.method)) {
		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}
	}

	if (req.method === 'GET') {

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).json(election.partyLists);
		await client.close();
		return;
	}

	if (req.method === 'POST') {

		if (!(await validateRequestCredentials({ req, res }))) {
			await client.close();
			return
		}

		if (!validateRequestBody({ req, res })) {
			await client.close();
			return;
		}

		const { name, placeOnBallot, color } = req.body;

		const id = crypto.randomBytes(3*4).toString('base64url');

		let partyList = {
			_id: id,
			name,
			placeOnBallot,
			color,
			numberOfCandidates: 0
		};

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (election.partyLists.find(partyList => partyList.name === name)) {
			message = 'There is already a party list with the same name!';
			res.status(409).send(message);
			await client.close();
			return;
		}

		const partyLists = [...election.partyLists, partyList];

		if (!await updatePartyLists(client, election, partyLists)) {
			message = 'Failed to update party lists!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(201).json(partyList);
		await client.close();
		return;
	}

	message = 'Only GET and POST requests are allowed!';
	res.status(405).send(message);
}

export function validateRequestBody({req, res}) {
	let message;
	const { name, placeOnBallot, color } = req.body;

	if (!name || name.trim() === '') {
		message = 'You did not provide a valid name for the party list!';
		res.status(400).send(message);
		return false;
	}

	try {
		if (!placeOnBallot) throw new Error();
		req.body['placeOnBallot'] = parseInt(placeOnBallot);
	} catch (error) {
		message = 'You did not provide a valid place on ballot property!';
		res.status(400).send(message);
		return false;
	}

	if (!placeOnBallot || typeof parseInt(placeOnBallot) !== 'number') {

	}

	if (!(/^#[A-Za-z0-9]{6}$/).test(color)) {
		message = 'You did not provide a valid party color!';
		res.status(400).send(message);
		return false;
	}

	return true;
}

const updatePartyLists = async (client, election, partyLists) => {
	try {
		await client.db().collection('elections')
			.updateOne({...election}, { $set: {partyLists} });
		return true;
	} catch (error) { return false; }
}

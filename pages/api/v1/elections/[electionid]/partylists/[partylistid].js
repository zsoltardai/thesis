import { validateRequestCredentials } from '../../../../../../lib/auth/server';
import { connect } from '../../../../../../lib/database';
import { validateRequestBody } from './index';
import { findElectionById } from '../index';

export default async function handler(req, res) {
	let client; let election; let message; let partyList;

	let ALLOWED = ['GET','PUT', 'DELETE'];

	if (ALLOWED.includes(req.method)) {
		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}
	}

	const { electionid, partylistid } = req.query;

	if (req.method === 'GET') {

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		partyList = election.partyLists.find(partyList => partyList._id === partylistid);

		if (!partyList) {
			message = 'There is no party list with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).json(partyList);
		await client.close();
		return;
	}

	if (req.method === 'PUT') {

		if (!(await validateRequestCredentials({req, res}))) {
			await client.close();
			return;
		}

		if (!validateRequestBody({req, res})) {
			await client.close();
			return;
		}

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		const record = election.partyLists.find(partyList => partyList._id === partylistid);

		if (!record) {
			message = 'There is no party list with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		const { name, placeOnBallot, color } = req.body;

		let partyList = {
			...record,
			name,
			placeOnBallot,
			color
		};

		let partyLists = election.partyLists.filter(partyList => partyList._id !== partylistid);

		partyLists.push(partyList);

		if (!(await updateElectionPartyLists(client, election, partyLists))) {
			message = 'Failed to update party list data!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(204).send();
		await client.close();
		return;
	}

	if (req.method === 'DELETE') {
		if (!(await validateRequestCredentials({ req, res }))) {
			await client.close();
			return
		}

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (!election.partyLists.find(partyList => partyList._id === partylistid)) {
			message = 'There is no party list with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		const partyLists = election.partyLists.filter(partyList => partyList._id !== partylistid);

		if (!(await updateElectionPartyLists(client, election, partyLists))) {
			message = 'Failed to update party list data!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(204).send();
		await client.close();
		return;
	}

	message = 'Only GET, DELETE and PUT requests are allowed!';
	res.status(405).send(message);
}

const updateElectionPartyLists = async (client, election, partyLists) => {
	try {
		await client.db()
			.collection('elections')
			.updateOne({...election},
				{$set: {partyLists}});
	} catch (error) {
		return false;
	}
	return true;
}

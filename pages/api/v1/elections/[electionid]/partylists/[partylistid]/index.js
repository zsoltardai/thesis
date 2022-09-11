import MysqlClient from '../../../../../../../lib/db/mysql-client';
import { validateRequestBody, electionExists } from '../index';

export default async function handler(req, res) {
	let message; let client;

	try {
		client = new MysqlClient({
			host: 'host.docker.internal',
			user: 'user',
			password: 'password',
			database: 'thesis'
		});
	} catch (error) {
		message = 'Failed to connect to the database, try again later.';
		res.status(500).send(message)
		return;
	}

	const { electionid, partylistid } = req.query;

	if (!(await electionExists(electionid, client))) {
		message = 'There is no election with the provided id!';
		res.status(400).send(message);
		client.close();
		return;
	}

	if (req.method === 'GET') {
		let partyList;

		try {
			const partyLists = await client.select(`election${electionid}partylists`, [], {
				id: partylistid
			});
			partyList = partyLists[0];
		} catch (error) {
			message = 'Failed to fetch party list from the database, try again later!';
			res.status(500).send(message);
			client.close();
			return;
		}

		if (!partyList) {
			message = 'There is no party list with the provided id!';
			res.status(404).send(message);
			client.close();
			return;
		}

		res.status(200).json(partyList);
		client.close();
		return;
	}

	if (req.method === 'DELETE') {

		try {
			const result = await client.delete(`election${electionid}partylists`, {
				id: partylistid
			});
			if (!result) {
				message = 'There is no party list with the provided id!';
				res.status(400).send(message);
				client.close();
				return false;
			}
		} catch (error) {
			message = 'Failed to delete party list from the database, try again later!';
			res.status(500).send(message);
			client.close();
			return false;
		}
		return true;

		res.status(204).send();
		client.close();
		return;
	}

	if (req.method === 'PUT') {

		if(!validateRequestBody({ req, res })) {
			return;
		}

		try {

		} catch (error) {

		}

		res.status(204).send();
		client.close();
		return;
	}

	res.status(405).send();
	client.close();
}

async function deletePartyListById(partyListId, client, { req, res }) {
	try {
		const result = await client.delete(`election${electionid}partylists`, {
			id: partylistid
		});
		if (!result) {
			message = 'There is no party list with the provided id!';
			res.status(400).send(message);
			client.close();
			return false;
		}
	} catch (error) {
		message = 'Failed to delete party list from the database, try again later!';
		res.status(500).send(message);
		client.close();
		return false;
	}
	return true;
}
import { validateRequestCredentials } from '../../../../../lib/auth/server';
import { validateRequestBody } from '../index';
import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
	let message; let client; let election;
	const ALLOWED = ['GET', 'DELETE', 'PUT'];

	const { electionid } = req.query;

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
			election = await client.db()
				.collection('elections')
				.findOne({_id: electionid});
		} catch (error) {
			message = 'Failed to fetch elections from the database, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}
		
		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).json(election);
		await client.close();
		return;
	}
	
	if (req.method === 'DELETE') {

		if (!(await validateRequestCredentials({ req, res }))) {
			await client.close();
			return
		}

		try {
			election = await client.db()
				.collection('elections')
				.findOne({_id: electionid});
		} catch (error) {
			message = 'Failed to fetch elections from the database, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		if (!election) {
			message = 'There is no election with the provided election id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		try {
			await client.db()
				.collection('elections')
				.deleteOne({
					_id: electionid
				});
		} catch (error) {
			message = 'Failed to delete election, try again later!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(204).send();
		await client.close();
		return;
	}

	if (req.method === 'PUT') {

		if (!(await validateRequestCredentials({ req, res }))) {
			await client.close();
			return;
		}

		if (!validateRequestBody({ req, res })) {
			await client.close();
			return;
		}

		let election;
		
		try {
			election = await client.db()
				.collection('elections')
				.findOne({_id: electionid});
		} catch (error) {
			message = 'Failed to fetch elections, try again later.';
			res.status(500).send(message);
			await client.close();
			return;
		}

		if (!election) {
			message = 'There is no election with the provided election id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		try {
			await client.db()
				.collection('elections')
				.updateOne({...election},
					{ $set: {...election} }
				);
		} catch (error) {
			message = 'Failed to update record!'
			res.status(500).send(message);
			return;
		}

		res.status(204).send()
		await client.close();
		return;
	}
	
	message = 'Only GET, POST, PUT requests are allowed!';
	res.status(405).send(message);
}

export const findElectionById = async (client, electionid) => {
	let election;
	try {
		election = await client.db()
			.collection('elections')
			.findOne({_id: electionid});
	} catch (error) { election = null; }
	return election;
}

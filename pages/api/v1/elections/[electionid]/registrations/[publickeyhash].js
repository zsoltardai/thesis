import { connect } from '../../../../../../lib/database';
import { findElectionById } from '../index';


export default async function handler(req, res) {
	let election; let client; let message;

	if (req.method === 'GET') {

		const { electionid, publickeyhash } = req.query;

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (!election.registrations.find(registration => registration.publicKeyHash === publickeyhash)) {
			message = 'You did not register for this election yet!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).send();
		await client.close();
		return;
	}

	message = 'Only GET requests are allowed!';
	res.status(405).send(message);
}

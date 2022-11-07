import { connect } from '../../../../../../lib/database';
import { findElectionById } from '../index';
import md5 from 'md5';

export default async function handler(req, res) {
	let election; let client; let message; let vote;

	if (req.method === 'GET') {

		const { electionid, publickeyhash } = req.query;

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later!';
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

		vote = election.votes.find(vote => vote.publicKeyHash === publickeyhash);

		if (!vote) {
			message = 'There is no vote with the provided public key!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).json(vote);
		return;
	}

	message = 'Only GET requests are allowed!';
	res.status(405).send(message);
}

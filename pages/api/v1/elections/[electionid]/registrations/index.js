import { verifyToken } from '../../../../../../lib/auth/server';
import { connect } from '../../../../../../lib/database';
import { findElectionById } from '../index';
import md5 from 'md5';


export default async function handler(req, res) {
	let election; let client; let message;

	if (req.method === 'POST') {

		const { electionid } = req.query;

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}

		if (!(await verifyToken({req, res}))) {
			await client.close();
			return;
		}

		if (!validateRequestBody({ req, res })) {
			await client.close();
			return;
		}

		const { publicKey } = req.body;

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (election.registrations.find(registration => registration.publicKeyPem === publicKey)) {
			message = 'Already registered to this election!';
			res.status(409).send(message);
			await client.close();
			return;
		}

		let previous = election.registrations.find(registration => registration._id === election.registrations.length);

		if (!previous) {
			previous = {
				_id: 0,
				previous: '__INITIAL_BLOCK__',
				publicKey: '__INITIAL_BLOCK__',
				publicKeyHash: md5('__INITIAL_BLOCK__'),
			};
		}

		const publicKeyHash = md5(publicKey);

		const registration = {
			_id: previous._id + 1,
			previous: md5(JSON.stringify(previous)),
			publicKey,
			publicKeyHash,
		};

		const registrations = [...election.registrations, registration];

		if (!(await updateRegistrations(client, election, registrations))) {
			message = 'Failed to register to the election!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		message = 'Successfully registered to ' + election.name + '!';
		res.status(201).send(message);
		await client.close();
		return;
	}

	message = 'Only POST requests are allowed!';
	res.status(405).send(message);
}


const validateRequestBody = ({ req, res }) => {
	let message;
	const { publicKey } = req.body;

	if (!publicKey || publicKey.length !== 460 || !publicKey.includes('-----BEGIN PUBLIC KEY-----')
		|| !publicKey.includes('-----END PUBLIC KEY-----')) {
		message = 'The provided public key was invalid!';
		res.status(400).send(message);
		return false;
	}

	return true;
}

export const updateRegistrations = async (client, election, registrations) => {
	try {
		await client.db()
			.collection('elections')
			.updateOne({...election},
				{$set: {registrations}});
	} catch (error) { return false; }
	return true;
};

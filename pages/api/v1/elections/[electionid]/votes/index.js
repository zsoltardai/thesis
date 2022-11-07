import { verifyToken } from '../../../../../../lib/auth/server';
import { connect } from '../../../../../../lib/database';
import RSA from '../../../../../../lib/encryption/rsa';
import { findElectionById } from '../index';
import md5 from 'md5';

export default async function handler(req, res) {
	let client; let message; let election;

	if (req.method === 'POST') {

		const { electionid } = req.query;

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}

		const session = await verifyToken({req, res})

		if (!session) {
			await client.close();
			return;
		}

		const { postalCode } = session;

		if (!validateRequestBody({req, res})) {
			await client.close();
			return;
		}

		const { publicKey, vote: { candidateId, partyListId }, signature } = req.body;

		election = await findElectionById(client, electionid);

		if(!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		/* Testing if there is a voting period right now. */

		const now = new Date();

		const start = new Date(election.voting.start)

		const end = new Date(election.voting.end);

		if (start < now < end) {
			const past = end < now;
			message = `The voting period ${past ? 'already has ended' : 'did not start yet'}!`;
			res.status(400).send(message);
			await client.close();
			return;
		}

		/* Testing if the user have already registered for the voting process. */

		if (!election.registrations.find(registration => registration.publicKey === publicKey)) {
			message = 'In order to vote, you have to register for the election!';
			res.status(400).send(message);
			await client.close();
			return;
		}

		/* Testing if the user has already voted. */

		if (election.votes.find(vote => vote.publicKeyHash === md5(publicKey))) {
			message = 'You have already voted in the election!';
			res.status(409).send(message);
			await client.close();
			return;
		}

		const districtId = findDistrictIdByPostalCode(election, postalCode);

		if (!districtId) {
			message = 'There is no electoral district for the provided postal code!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (!election.candidates.find(candidate => {
			return (candidate._id === candidateId && candidate.electionDistrictId === districtId);
		})) {
			message = 'There is no candidate with the provided id, in your district!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (!election.partyLists.find(partyList => partyList._id === partyListId)) {
			message = 'There is no party list with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (!RSA.verify(publicKey, JSON.stringify({
			candidateId,
			partyListId
		}), signature)) {
			message = 'The provided vote signature was invalid!';
			res.status(403).send(message);
			await client.close();
			return;
		}

		let previous = election.votes.find(vote => vote._id === election.votes.length);

		if (!previous) {
			previous = {
				_id: 0,
				previous: '__INITIAL_BLOCK__',
				publicKey: '__INITIAL_BLOCK__',
				vote: '__INITIAL_BLOCK__'
			};
		}

		let vote = {
			_id: previous._id + 1,
			previous: md5(JSON.stringify(previous)),
			vote: {
				candidateId,
				partyListId,
			},
			signature,
			publicKey,
			publicKeyHash: md5(publicKey)
		};

		const votes = [...election.votes, vote];

		if (!(await updateVotes(client, election, votes))) {
			message = 'Failed to cast your vote, try again later.';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(201).json(vote);
		await client.close();
		return;
	}

	message = 'Only POST requests are allowed!';
	res.status(405).send(message);
}

export const updateVotes = async (client, election, votes) => {
	try {
		await client.db()
			.collection('elections')
			.updateOne({...election},
				{$set: {votes}});
	} catch (error) { return false; }
	return true;
};


const validateRequestBody = (options) => {
	const { req, res } = options; let message;
	const { publicKey, vote } = req.body;

	if (!publicKey || publicKey.length !== 460 || !publicKey.includes('-----BEGIN PUBLIC KEY-----')
			|| !publicKey.includes('-----END PUBLIC KEY-----')) {
		message = 'The provided public key was invalid!';
		res.status(400).send(message);
		return false;
	}

	const { candidateId, partyListId } = vote;

	if (!candidateId || candidateId.trim() === '') {
		message = 'You did not provide a valid candidate id!';
		res.status(400).send(message);
		return false;
	}

	if (!partyListId || partyListId.trim() === '') {
		message = 'You did not provide a valid party list id!';
		res.status(400).send(message);
		return false;
	}

	return true;
};

const findDistrictIdByPostalCode = (election, postalCode) => {
	return election.districts.find(district => {
		return district.postalCodes.includes(postalCode.toString());
	})['_id'] || null;
}

import {MongoClient} from 'mongodb';
import {findElectionById} from '../index';
import {validateRequestCredentials} from '../../../../../../lib/auth/server';
import {updateCandidates, validateRequestBody} from './index';
import {updateElectionDistrict} from '../districts';
import {findElectionDistrictById} from '../districts/[districtid]';
import md5 from 'md5';

export default async function handler(req, res) {
	let message; let election; let client;
	const ALLOWED = ['GET', 'DELETE', 'PUT'];

	if (ALLOWED.includes(req.method)) {
		try {
			client = await MongoClient.connect(process.env.MONGODB);
		} catch (error) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}
	}

	const { electionid, candidateid } = req.query;

	if (req.method === 'GET') {

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			await client.close();
			res.status(404).send(message);
			return;
		}

		const candidate = election.candidates.find(candidate => candidate._id === candidateid);

		if (!candidate) {
			message = 'There is no candidate with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).json(candidate);
		await client.close();
		return;
	}

	if (req.method === 'PUT') {
		if (!(await validateRequestCredentials({req, res}))) {
			await client.close();
			return;
		}

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (!validateRequestBody(election, {req, res}, true)) {
			await client.close();
			return;
		}

		const record = findCandidateById(election, candidateid);

		if (!record) {
			message = 'There is no candidate with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		const { firstName, lastName, identityNumber, partyListId, placeOnPartyList } = req.body;

		const identityNumberHash = md5(identityNumber);

		const candidate = {
			...record,
			firstName,
			lastName,
			identityNumberHash,
			partyListId,
			placeOnPartyList
		};

		const candidates = [...election.candidates.filter(candidate => candidate._id !== candidateid), candidate];

		if (!(await updateCandidates(client, election, candidates))) {
			message = 'Failed to update candidate!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(204).send();
		await client.close();
		return;
	}

	if (req.method === 'DELETE') {

		if (!(await validateRequestCredentials({req, res}))) {
			await client.close();
			return;
		}

		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		if (!election.candidates.find(candidate => candidate._id === candidateid)) {
			message = 'There is no candidate with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		const candidates = election.candidates.filter(candidate => candidate._id !== candidateid);

		if (!(await updateCandidates(client, election, candidates))) {
			message = 'Failed to remove candidate!';
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

export const findCandidateById = (election, candidateid) => {
	return election.candidates.find(candidate => candidate._id === candidateid);
};
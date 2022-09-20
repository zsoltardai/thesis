import { validateRequestCredentials } from '../../../../../../lib/auth/server';
import { findElectionById } from '../index';
import { MongoClient } from 'mongodb';
import * as crypto from 'crypto';
import md5 from 'md5';

export default async function handler(req, res) {
	let election; let message; let client;
	const ALLOWED = ['GET', 'POST'];

	if (ALLOWED.includes(req.method)) {
		try {
			client = await MongoClient.connect(process.env.MONGODB);
		} catch (error) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			await client.close();
			return;
		}
	}

	const { electionid } = req.query;

	if (req.method === 'GET') {
		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).json(election.candidates);
		await client.close();
		return;
	}

	if (req.method === 'POST') {

		if (!(await validateRequestCredentials({req, res}))) {
			await client.close();
			return;
		}

		election = await findElectionById(client, electionid);

		if (!validateRequestBody(election, {req, res})) {
			await client.close();
			return;
		}

		const { firstName, lastName, identityNumber, partyListId, placeOnPartyList, electionDistrictId } = req.body;

		const identityNumberHash = md5(identityNumber);

		const id = crypto.randomBytes(3*4).toString('base64url');

		const candidate = {
			_id: id,
			firstName,
			lastName,
			identityNumberHash
		};

		if (partyListId) {
			candidate['partyListId'] = partyListId;
			candidate['placeOnPartyList'] = placeOnPartyList;
		}

		if (electionDistrictId) {
			candidate['electionDistrictId'] = electionDistrictId;
		}

		const candidates = [...election.candidates, candidate];

		if (!(await updateCandidates(client, election, candidates))) {
			message = 'Failed to add the candidate to the candidates list!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(201).json(candidate);
		await client.close();
		return;
	}

	message = 'Only GET and POST requests are allowed!';
	res.status(405).send(message);
}

export const validateRequestBody = (election, { req, res }, update) => {
	let message; const { candidates, districts, partyLists } = election;
	const { firstName, lastName, identityNumber, partyListId, placeOnPartyList, electionDistrictId } = req.body;

	if (!firstName || firstName.trim() === '') {
		message = 'You did not provide a valid first name!';
		res.status(400).send(message);
		return false;
	}

	if (!lastName || lastName.trim() === '') {
		message = 'You did not provide a valid last name!';
		res.status(400).send(message);
		return false;
	}

	if (!(/^[0-9]{6}[A-Z]{2}$/).test(identityNumber)) {
		message = 'You did not provide a valid identity number!';
		res.status(400).send(message);
		return false;
	}

	if (!update && candidates.find(candidate => candidate.identityNumberHash === md5(identityNumber))) {
		message = 'There is a candidate with the provided identity number!';
		res.status(400).send(message);
		return false;
	}

	if (electionDistrictId && !districts.find(district => district._id === electionDistrictId)) {
		message = 'There is no election district with the provided id!';
		res.status(400).send(message);
		return false;
	}

	if (partyListId && !partyLists.find(partyList => partyList._id === partyListId)) {
		message = 'There is no party list with the provided id!';
		res.status(400).send(message);
		return false;
	}

	if (partyListId && !placeOnPartyList) {
		message = 'You have to provide the canidate\'s place on the party list!';
		res.status(400).send(message);
		return false;
	}

	if (partyListId && candidates.find(candidate => {
		return candidate['partyListId'] === partyListId
				&& candidate['placeOnPartyList'] === placeOnPartyList;
	})) {
		message = 'There is someone else who is on the same place on the same party list!';
		res.status(400).send(message);
		return false;
	}

	return true;
}


export const updateCandidates = async (client, election, candidates) => {
	try {
		await client.db()
			.collection('elections')
			.updateOne({...election},
				{$set: {candidates}});
	} catch (error) { return false; }
	return true;
}
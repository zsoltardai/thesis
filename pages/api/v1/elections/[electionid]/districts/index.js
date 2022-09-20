import { validateRequestCredentials } from '../../../../../../lib/auth/server';
import { findElectionById } from '../index';
import { MongoClient } from 'mongodb';
import * as crypto from 'crypto';

export default async function handler(req, res) {
	let election; let client; let message;
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

		res.status(200).json(election.districts);
		await client.close();
		return;
	}

	if (req.method === 'POST') {

		if (!(await validateRequestCredentials({ req, res }))) {
			await client.close();
			return;
		}

		election = await findElectionById(client, electionid);

		if (!validateRequestBody(election, {req, res})) {
			await client.close();
			return;
		}

		const id = crypto.randomBytes(3 * 4).toString('base64url');

		const { name, postalCodes } = req.body;

		const district = {
			_id: id,
			name,
			postalCodes
		};

		const districts = [...election.districts, district];

		if (!(await updateElectionDistrict(client, election, districts))) {
			message = 'Failed to insert election district to the database!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(201).json(district);
		await client.close();
		return;
	}

	message = 'Only GET and POST requests are allowed!';
	res.status(405).send(message);
}

export const validateRequestBody = (election, {req, res}) => {
	let message; const { districts } = election;
	const	{ name, postalCodes } = req.body;
	const { districtid } = req.query;

	if (!name || name.trim() === '') {
		message = 'You did not provide a valid name!';
		res.status(400).send(message);
		return false;
	}

	if (!districtid && (districts.find(district => district.name === name))) {
		message = 'There is already a district with the exact same name!';
		res.status(409).send(message);
		return false;
	}

	if (!postalCodes || !Array.isArray(postalCodes)) {
		message = 'You did not provide a valid list of postal codes!';
		res.status(400).send(message);
		return false;
	}

	for (let postalCode of postalCodes) {
		for (let district of districts) {
			if (district._id === districtid) continue;
			if (district.postalCodes.includes(postalCode)) {
				message = `The postal code: ${postalCode} is already included` +
						`in a different district with the id of: ${district._id}!`;
				res.status(409).send(message);
				return false;
			}
		}
	}

	return true;
};

export const updateElectionDistrict = async (client, election, districts) => {
	try {
		await client.db()
			.collection('elections')
			.updateOne({...election},
				{$set: {districts}});
	} catch (error) { return false; }
	return true;
};

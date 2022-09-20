import { findElectionById } from '../index';
import { MongoClient } from 'mongodb';
import {validateRequestCredentials} from '../../../../../../lib/auth/server';
import {updateElectionDistrict, validateRequestBody} from './index';

export default async function handler(req, res) {
	let election; let message; let client;
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

	const { electionid, districtid } = req.query;

	if (req.method === 'GET') {
		election = await findElectionById(client, electionid);

		if (!election) {
			message = 'There is no election with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		const district = election.districts.find(district => district._id === districtid);

		if (!district) {
			message = 'There is no electoral district with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		res.status(200).json(district);
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

		if (!election.districts.find(district => district._id === districtid)) {
			message = 'There is no electoral district with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		const districts = election.districts.filter(district => district._id !== districtid);

		if (!(await updateElectionDistrict(client, election, districts))) {
			message = 'Failed to remove electoral district!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(204).send();
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

		if (!validateRequestBody(election, {req, res})) {
			await client.close();
			return;
		}

		const record = findElectionDistrictById(election, districtid);

		if (!record) {
			message = 'There is no electoral district with the provided id!';
			res.status(404).send(message);
			await client.close();
			return;
		}

		const { name, postalCodes } = req.body;

		const district = {
			...record,
			name,
			postalCodes
		};

		const districts = [...election.districts.filter(district => district._id !== districtid), district];

		if (!(await updateElectionDistrict(client, election, districts))) {
			message = 'Failed to update electoral district!';
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

export const findElectionDistrictById = (election, districtid) => {
	return election.districts.find(district => district._id === districtid);
};
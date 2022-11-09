import { connect } from '../../../../../../lib/database';
import { findElectionById } from '../index';

export default async function handler(req, res) {
	let election; let message; let client;

	if (req.method === 'GET') {
		try {
			client = await connect();
		} catch (error) {
			message = 'Failed to connect to the database, try again later!';
			res.status(500).send(message);
			return;
		}

		const { electionid, postalcode } = req.query;

		if (!await findSettlementIfExists(client, postalcode)) {
			message = `There is no settlement with the provided postal code: ${postalcode}`;
			res.status(404).send(message);
			await client.close();
			return;
		}

		election = await findElectionById(client, electionid);

		if (!election) {
			message = `There is no election with the provided id: ${electionid}`;
			res.status(404).send(message);
			await client.close();
			return;
		}

		let districtId = null;

		for (let i = 0; i < election.districts.length; i++) {
			const district = election.districts[i];
			if (district.postalCodes.includes(postalcode)) {
				districtId = district._id;
				break;
			}
		}

		const candidates = [];

		for (let i = 0;  i < election.candidates.length; i++) {
			const candidate = election.candidates[i];
			if (candidate.electionDistrictId === districtId) {
				candidates.push(candidate);
			}
		}

		const partyLists = election.partyLists;

		res.status(200).json({
			district: districtId,
			candidates,
			partyLists,
		});
		await client.close();
		return;
	}

	message = 'Only GET requests are allowed!';
	res.status(405).send(message);
}

const findSettlementIfExists = async (client, postalcode) => {
	const postalCode = parseInt(postalcode);
	const result = await client.db().collection('settlements').findOne({postalCode});
	return result;
}

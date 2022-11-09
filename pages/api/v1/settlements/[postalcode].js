import { connect } from '../../../../lib/database';


export default async function handler(req, res) {
	let client; let message; let settlement;

	if (req.method === 'GET') {

		const { postalcode } = req.query;

		client = await connect();

		if (!client) {
			message = 'Failed to connect to the database, try again later.';
			res.status(500).send(message);
			return;
		}

		try {
			settlement = await client.db().collection('settlements').findOne({postalCode: postalcode});
		} catch (error) {
			message = 'Failed to fetch postal codes from the database!';
			res.status(500).send(message);
			await client.close();
			return;
		}

		res.status(200).json(settlement);
		await client.close();
		return;
	}


	message = 'Only GET and POST requests are allowed!';
	res.status(405).send(message);
}

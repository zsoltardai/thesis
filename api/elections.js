import client, { requestConfig } from './client';

const endpoint = '/elections';

const getElections = () =>
	client.get(
		endpoint,
		{},
		{ headers: { ...requestConfig().headers } }
	);


const getElection = (id) =>
	client.get(
		`${endpoint}/${id}`,
		{ },
		{ headers: { ...requestConfig().headers } }
	);

export default {
	getElections,
	getElection,
};

import client, { requestConfig } from './client';

const endpoint = '/elections';

const getCandidates = ({electionid, postalcode}) =>
	client.get(
		`${endpoint}/${electionid}/findmycandidates/${postalcode}`,
		{},
		{ headers: { ...requestConfig().headers } }
	);

export default {
	getCandidates,
};

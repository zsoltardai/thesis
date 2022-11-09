import client, { requestConfig } from './client';

const endpoint = '/elections';

const getVote = ({electionid, publickeyhash}) =>
	client.get(
		`${endpoint}/${electionid}/votes/${publickeyhash}`,
		{},
		{ headers: { ...requestConfig().headers } }
	);

const vote = ({electionid, body}) => {
	return client.post(
		`${endpoint}/${electionid}/votes`,
		{ ...body },
		{}
	);
}


export default {
	getVote,
	vote,
};

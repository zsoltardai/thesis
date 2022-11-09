import client, { requestConfig } from './client';

const endpoint = '/elections';

const getRegistration = ({electionid, publickeyhash}) =>
	client.get(
		`${endpoint}/${electionid}/registrations/${publickeyhash}`,
		{},
		{ headers: { ...requestConfig().headers } }
	);

const register = ({electionid, publickey}) => {
	const body = {
		publicKey: publickey
	};
	return client.post(
		`${endpoint}/${electionid}/registrations`,
		{ ...body },
		{}
	);
}


export default {
	getRegistration,
	register,
};

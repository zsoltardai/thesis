import client, { requestConfig } from './client';

const endpoint = '/auth/session';

const getSession = () =>
	client.get(
		endpoint,
		{},
		{ headers: { ...requestConfig().headers } }
	);

export default {
	getSession,
};

import { create } from 'apisauce';

const client = create({
	baseURL: process.env.BASE_URL || '/api/v1',
});

client.addRequestTransform(request => {
	console.log('url: ' + client.getBaseURL() + request.url);
})

const requestConfig = () => {
	const headers = {
		Accept: 'application/json',
	};
	return {
		headers,
	};
};

export default client;
export { requestConfig };

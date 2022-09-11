import { deleteCookie } from 'cookies-next';

export const COOKIES = {
	token: 'auth.token',
	encryptedPrivateKeyPem: 'auth.encrypted-private-key-pem',
	encryptedIdentityNumber: 'auth.encrypted-identity-number',
	encryptedFirstName: 'auth.encrypted-first-name',
	encryptedLastName: 'auth.encrypted-last-name',
	encryptedEmail: 'auth.encrypted-email'
};

export async function signIn(email, passwordHash, callback) {
	const headers = {
		'Content-Type': 'application/json',
		Accept: 'application/json' 
	};
	const body = JSON.stringify({
		email: email,
		passwordHash: passwordHash
	});
	const url = '/api/v1/auth/login';
	const response = await fetch(url, {
		method: 'POST',
		headers: headers,
		body: body
	});
	const data = await response.json();
	const { message } = data;
	if (response.status !== 200) {
		callback(message, null);
		return;
	}
	callback(null, message);
}

export function signOut() {
	Object.keys(COOKIES)
		.forEach(key => {
		  deleteCookie(COOKIES[key]);
		});
	return true;
}

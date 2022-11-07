import { COOKIES } from './client';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import RSA from '../encryption/rsa';

export async function getSession(options) {
	let user = {}; let token = getCookie('auth.token', options);
	if (token === undefined) return null;
	Object.keys(COOKIES)
		.forEach(key => {
			if (key !== 'token') {
				user[key] = getCookie(COOKIES[key], options);
			}
		});
	if (Object.keys(user).some(key => user[key] === undefined)) return null;
	try {
		token = await (() => {
			const key = fs.readFileSync(path.join(process.cwd(), 'key.pub'));
			return new Promise((resolve, reject) => {
				jwt.verify(token, key, {}, (error, decoded) => {
					if (!error) resolve(decoded);
					reject(error);
				});
				resolve(null);
			});
		})();
	} catch (error) {
		return null;
	}
	return { token, user };
}

export async function validateRequestCredentials({ req, res }) {
	if (req.headers['signature']) return validateRequestSignature({ req, res });
	return validateRequestToken({ req, res });
}

export async function validateRequestToken({ req, res }) {
	let message; let session;
	session = await verifyToken({ req, res });
	if (!session) {
		message = 'Your request did not contain a valid token or a signature!';
		res.status(400).send(message);
		return false;
	}
	if (!session['isAdmin'] || session['isAdmin'] !== true) {
		message = 'Unauthorized!';
		res.status(403).send(message);
		return false;
	}
	return true;
}

export function validateRequestSignature({ req, res }) {
	let signature; let message;
	signature = req.headers['signature'];
	if (!signature) {
		message = 'Unauthorized!';
		res.status(403).send(message);
		return false;
	}
	const pem = fs.readFileSync(path.join(process.cwd(), 'key.key'), 'utf8');
	const rsa = new RSA(pem);
	message = JSON.stringify(req.body);
	if (!rsa.verify(message, signature)) {
		message = 'Unauthorized!';
		res.status(403).send(message);
		return false;
	}
	return true;
}

export const verifyToken = async (options) => {
	let token = getCookie('auth.token', options);
	if (!token) return false;
	try {
		return (() => {
			const key = fs.readFileSync(path.join(process.cwd(), 'key.pub'));
			return new Promise((resolve, reject) => {
				jwt.verify(token, key, {}, (error, decoded) => {
					if (!error) resolve(decoded);
					reject(error);
				});
				resolve(null);
			});
		})();
	} catch(error) {
		return null;
	}
}
